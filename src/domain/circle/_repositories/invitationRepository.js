const util = require('util')
const _ = require('lodash')
const uuidv4 = require('uuid/v4')
const types = require('config').database.types
const Repository = require('../../../library/repository')

function parseConditions (obj) {
  let idx = 5
  const datatypes = {
    iid: 'uuid',
    event: 'varchar'
  }
  const params = []
  const conditions = []
  for (const p in obj) {
    const cond = `${p} = $${idx++}::${datatypes[p]}`
    conditions.push(cond)
    params.push(obj[p])
  }

  return {
    conditions: conditions.join(' AND '),
    params
  }
}

util.inherits(InvitationRepository, Repository)

function InvitationRepository (pool) {
  this.pool = pool
}

/**
 * TODO: 
 * 改變 function params 輸入參數。
 * 在 Service 層使用時需要調整格式 (無論輸出/輸入)
 * @param {{ uid: string, region: string }} inviterAccountIdentity
 * @param {{ uid: string, region: string }} recipientAccountIdentity
 * @param {string} event
 * @param {Object} info
 */
InvitationRepository.prototype.findOrCreateFriendInvitation = async function (inviterAccountIdentity, recipientAccountIdentity, event, info) {
  let idx = 1
  return this.query(
    `
    INSERT INTO "Invitations" (iid, inviter_uid, inviter_region, recipient_uid, recipient_region, event, info, deleted_at)
    VALUES (
      $${idx++}::uuid,
      $${idx++}::uuid, -- inviter_uid
      $${idx++}::varchar,
      $${idx++}::uuid, -- recipient_uid
      $${idx++}::varchar,
      $${idx++}::varchar, -- event
      $${idx++}::jsonb,
      $${idx++}::timestamp
    )
    ON CONFLICT ON CONSTRAINT "Invitations_inviter_uid_inviter_region_recipient_uid_recipi_key"
    DO UPDATE SET
      info = $${idx++}::jsonb,
      deleted_at = $${idx++}::timestamp,
      updated_at = NOW() AT time zone 'utc'
    RETURNING *;
    `,
    [
      uuidv4(),
      inviterAccountIdentity.uid,
      inviterAccountIdentity.region,
      recipientAccountIdentity.uid,
      recipientAccountIdentity.region,
      event,
      JSON.stringify(info),
      null,
      // ON CONFLICT ... DO action
      JSON.stringify(info),
      null
    ],
    0)
}

/**
 * @param {{ uid: string, region: string }} accountIdentity
 * @param {{ iid: string }|{ event: string }|{ iid: string, event: string }} invitationInfo
 */
InvitationRepository.prototype.getInvitation = async function (accountIdentity, invitationInfo) {
  let { conditions, params } = parseConditions(invitationInfo)
  params = [
    accountIdentity.uid,
    accountIdentity.region,
    accountIdentity.uid,
    accountIdentity.region
  ].concat(params)

  return this.query(
    `
    SELECT *
    FROM "Invitations"
    WHERE
      deleted_at IS NULL AND
      (
        inviter_uid = $1::uuid AND inviter_region = $2::varchar OR  
        recipient_uid = $3::uuid AND recipient_region = $4::varchar 
      ) AND
      ${conditions}
    LIMIT 1;
    `,
    params,
    0)
}

/**
 * @param {{ uid: string, region: string }} accountIdentity
 * @param {{ uid: string, region: string }} targetAccountIdentity
 */
InvitationRepository.prototype.getInvitationByRoles = async function (accountIdentity, targetAccountIdentity) {
  let idx = 1
  return this.query(
    `
    SELECT *
    FROM "Invitations"
    WHERE
      (
        deleted_at IS NULL AND
        inviter_uid = $${idx++}::uuid AND inviter_region = $${idx++}::varchar AND  
        recipient_uid = $${idx++}::uuid AND recipient_region = $${idx++}::varchar 
      ) 
      OR
      (
        deleted_at IS NULL AND
        recipient_uid = $${idx++}::uuid AND recipient_region = $${idx++}::varchar AND
        inviter_uid = $${idx++}::uuid AND inviter_region = $${idx++}::varchar 
      )
    LIMIT 1;
    `,
    [
      accountIdentity.uid,
      accountIdentity.region,
      targetAccountIdentity.uid,
      targetAccountIdentity.region,
      accountIdentity.uid,
      accountIdentity.region,
      targetAccountIdentity.uid,
      targetAccountIdentity.region
    ],
    0)
}

/**
 * @param {{ uid: string, region: string }} accountIdentity
 * @param {number} limit
 * @param {number} skip
 */
InvitationRepository.prototype.getSentInvitationList = async function (accountIdentity, limit, skip) {
  let idx = 1
  return this.query(
    `
    SELECT *
    FROM "Invitations"
    WHERE
      deleted_at IS NULL AND
      inviter_uid = $${idx++}::uuid AND
      inviter_region = $${idx++}::varchar 
    OFFSET $${idx++}::int LIMIT $${idx++}::int;
    `,
    [
      accountIdentity.uid,
      accountIdentity.region,
      skip,
      limit
    ])
}

/**
 * @param {{ uid: string, region: string }} accountIdentity
 * @param {number} limit
 * @param {number} skip
 */
InvitationRepository.prototype.getReceivedInvitationList = async function (accountIdentity, limit, skip) {
  let idx = 1
  return this.query(
    `
    SELECT *
    FROM "Invitations"
    WHERE
      deleted_at IS NULL AND
      recipient_uid = $${idx++}::uuid AND
      recipient_region = $${idx++}::varchar
    OFFSET $${idx++}::int LIMIT $${idx++}::int;
    `,
    [
      accountIdentity.uid,
      accountIdentity.region,
      skip,
      limit
    ])
}

/**
 * invitationRepo
 * 不論是否跨區域，有可能雙方幾乎同時發送了邀請，也同時建立了invitation records,
 * 導致雙方都是邀請者/受邀者，所以刪除時 需考慮這種情況 (刪除至多 2 筆資訊)
 * accountInfo (uid, region)
 * targetAccountInfo (uid, region)
 *
 * [跨區域操作時使用]
 * softDelete: 跨區域操作時使用，若雙邊操作需要 rollback 有機會補教。等雙邊都 commit 再硬刪除 (hard delete)
 * @param {{ uid: string, region: string }} inviterAccountIdentity
 * @param {{ uid: string, region: string }} recipientAccountIdentity
 * @param {string} event
 * @param {boolean} softDelete
 */
InvitationRepository.prototype.removeRelatedInvitation = async function (inviterAccountIdentity, recipientAccountIdentity, event, softDelete = false) {
  let idx = 1
  const operation = softDelete === true ? `UPDATE "Invitations" SET deleted_at = NOW() AT time zone 'utc'` : 'DELETE FROM "Invitations"'
  return this.query(
    `
    ${operation}
    WHERE 
      inviter_uid = $${idx++}::uuid AND
      inviter_region = $${idx++}::varchar AND
      recipient_uid = $${idx++}::uuid AND
      recipient_region = $${idx++}::varchar AND
      event = $${idx++}
    RETURNING *;
    `,
    [
      inviterAccountIdentity.uid,
      inviterAccountIdentity.region,
      recipientAccountIdentity.uid,
      recipientAccountIdentity.region,
      event
    ])
}

module.exports = InvitationRepository

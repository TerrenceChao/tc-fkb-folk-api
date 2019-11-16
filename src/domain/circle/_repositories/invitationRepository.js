const util = require('util')
const pool = require('config').database.pool
const Repository = require('../../../library/repository')

function parseConditions (obj) {
  let idx = 5
  const datatypes = {
    iid: 'bigint',
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
 * @param {{ uid: string, region: string }} inviterAccount
 * @param {{ uid: string, region: string }} recipientAccount
 * @param {string} event
 * @param {Object} info
 */
InvitationRepository.prototype.createOrUpdateInvitation = async function (inviterAccount, recipientAccount, event, info) {
  let idx = 1
  return this.query(
    `
    INSERT INTO "Invitations" (inviter_id, inviter_region, recipient_id, recipient_region, event, info, deleted_at)
    VALUES (
      $${idx++}::uuid, -- inviter_id
      $${idx++}::varchar,
      $${idx++}::uuid, -- recipient_id
      $${idx++}::varchar,
      $${idx++}::varchar, -- event
      $${idx++}::jsonb,
      $${idx++}::timestamp
    )
    ON CONFLICT ON CONSTRAINT "Invitations_inviter_id_inviter_region_recipient_id_recipien_key"
    DO UPDATE SET
      info = $${idx++}::jsonb,
      deleted_at = $${idx++}::timestamp,
      updated_at = NOW() AT time zone 'utc'
    RETURNING *;
    `,
    [
      inviterAccount.uid,
      inviterAccount.region,
      recipientAccount.uid,
      recipientAccount.region,
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
 * @param {{ uid: string, region: string }} account
 * @param {{ iid: number }|{ event: string }|{ iid: number, event: string }} invitationInfo
 */
InvitationRepository.prototype.getInvitation = async function (account, invitationInfo) {
  let { conditions, params } = parseConditions(invitationInfo)
  params = [
    account.uid,
    account.region,
    account.uid,
    account.region
  ].concat(params)

  return this.query(
    `
    SELECT *
    FROM "Invitations"
    WHERE
      deleted_at IS NULL AND
      (
        inviter_id = $1::uuid AND inviter_region = $2::varchar OR  
        recipient_id = $3::uuid AND recipient_region = $4::varchar 
      ) AND
      ${conditions}
    LIMIT 1;
    `,
    params,
    0)
}

/**
 * @param {{ uid: string, region: string }} account
 * @param {{ uid: string, region: string }} targetAccount
 */
InvitationRepository.prototype.getInvitationByRoles = async function (account, targetAccount) {
  let idx = 1
  return this.query(
    `
    SELECT *
    FROM "Invitations"
    WHERE
      (
        deleted_at IS NULL AND
        inviter_id = $${idx++}::uuid AND inviter_region = $${idx++}::varchar AND  
        recipient_id = $${idx++}::uuid AND recipient_region = $${idx++}::varchar 
      ) 
      OR
      (
        deleted_at IS NULL AND
        recipient_id = $${idx++}::uuid AND recipient_region = $${idx++}::varchar AND
        inviter_id = $${idx++}::uuid AND inviter_region = $${idx++}::varchar 
      )
    LIMIT 1;
    `,
    [
      account.uid,
      account.region,
      targetAccount.uid,
      targetAccount.region,
      account.uid,
      account.region,
      targetAccount.uid,
      targetAccount.region
    ],
    0)
}

/**
 * @param {{ uid: string, region: string }} account
 * @param {number} limit
 * @param {number} skip
 */
InvitationRepository.prototype.getSentInvitationList = async function (account, limit, skip) {
  let idx = 1
  return this.query(
    `
    SELECT *
    FROM "Invitations"
    WHERE
      deleted_at IS NULL AND
      inviter_id = $${idx++}::uuid AND
      inviter_region = $${idx++}::varchar 
    OFFSET $${idx++}::int LIMIT $${idx++}::int;
    `,
    [
      account.uid,
      account.region,
      skip,
      limit
    ])
}

/**
 * @param {{ uid: string, region: string }} account
 * @param {number} limit
 * @param {number} skip
 */
InvitationRepository.prototype.getReceivedInvitationList = async function (account, limit, skip) {
  let idx = 1
  return this.query(
    `
    SELECT *
    FROM "Invitations"
    WHERE
      deleted_at IS NULL AND
      recipient_id = $${idx++}::uuid AND
      recipient_region = $${idx++}::varchar
    OFFSET $${idx++}::int LIMIT $${idx++}::int;
    `,
    [
      account.uid,
      account.region,
      skip,
      limit
    ])
}

/**
 * invitationRepo
 * 不論是否跨區域，有可能雙方幾乎同時發送了邀請，也同時建立了invitation records,
 * 導致雙方都是邀請者/受邀者，所以刪除時 需考慮這種情況 (刪除至多 2 筆資訊)
 * account (uid, region)
 * targetAccount (uid, region)
 *
 * [跨區域操作時使用]
 * softDelete: 跨區域操作時使用，若雙邊操作需要 rollback 有機會補教。等雙邊都 commit 再硬刪除 (hard delete)
 * @param {{ uid: string, region: string }} inviterAccount
 * @param {{ uid: string, region: string }} recipientAccount
 * @param {string} event
 * @param {boolean} softDelete
 */
InvitationRepository.prototype.removeRelatedInvitation = async function (inviterAccount, recipientAccount, event, softDelete = false) {
  let idx = 1
  const operation = softDelete === true ? `UPDATE "Invitations" SET deleted_at = NOW() AT time zone 'utc'` : 'DELETE FROM "Invitations"'
  return this.query(
    `
    ${operation}
    WHERE 
      (
        inviter_id = $${idx++}::uuid AND
        inviter_region = $${idx++}::varchar AND
        recipient_id = $${idx++}::uuid AND
        recipient_region = $${idx++}::varchar AND
        event = $${idx++}
      )
      OR
      (
        recipient_id = $${idx++}::uuid AND
        recipient_region = $${idx++}::varchar AND
        inviter_id = $${idx++}::uuid AND
        inviter_region = $${idx++}::varchar AND
        event = $${idx++}
      )
    RETURNING *;
    `,
    [
      inviterAccount.uid,
      inviterAccount.region,
      recipientAccount.uid,
      recipientAccount.region,
      event,

      inviterAccount.uid,
      inviterAccount.region,
      recipientAccount.uid,
      recipientAccount.region,
      event
    ])
}

module.exports = {
  invitationRepository: new InvitationRepository(pool),
  InvitationRepository
}

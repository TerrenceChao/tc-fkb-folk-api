const util = require('util')
const _ = require('lodash')
const types = require('config').database.types
const Repository = require('../../../library/repository')

util.inherits(FriendRepository, Repository)

function FriendRepository (pool) {
  this.pool = pool
}

/**
 * [NOTE]
 * [targetPublicUserInfo] at least includes { uid, region } (must have),
 * but may alse inclues { givenName, familyName, fullName(option), profilePic, profileLink } [同區域/跨區域操作皆需要如此]
 * @param {{ uid: string, region: string }} accountIdentity
 * @param {Object} targetPublicUserInfo
 * @return {Object|null} friend
 */
FriendRepository.prototype.addFriend = async function (accountIdentity, targetPublicUserInfo) {
  let idx = 1
  const publicInfo = _.omit(targetPublicUserInfo, ['uid', 'region'])

  return this.query(
    `
    INSERT INTO "Friends" (user_id, friend_id, friend_region, public_info, deleted_at)
    VALUES ($${idx++}::uuid, $${idx++}::uuid, $${idx++}::varchar, $${idx++}::jsonb, $${idx++}::timestamp) 
    RETURNING *;
    `,
    [
      accountIdentity.uid,
      targetPublicUserInfo.uid,
      targetPublicUserInfo.region,
      JSON.stringify(publicInfo),
      null
    ],
    0)
}

/**
 * @param {{ uid: string, region: string }} accountIdentity
 * @param {{ uid: string, region: string }} targetAccountIdentity
 * @return {Object|null} friend
 */
FriendRepository.prototype.getFriend = async function (accountIdentity, targetAccountIdentity) {
  let idx = 1
  return this.query(
    `
    SELECT user_id, friend_id, friend_region, public_info
    FROM "Friends" AS f
    WHERE
      deleted_at IS NULL AND
      user_id = $${idx++}::uuid AND
      friend_id = $${idx++}::uuid AND
      friend_region = $${idx++}::varchar;
    `,
    [
      accountIdentity.uid,
      targetAccountIdentity.uid,
      targetAccountIdentity.region
    ],
    0)
}

/**
 * @param {{ uid: string, region: string }} accountIdentity
 * @param {number} limit
 * @param {number} skip
 * @return {Object[]} friend list
 */
FriendRepository.prototype.getFriendList = async function (accountIdentity, limit, skip) {
  let idx = 1
  return this.query(
    `
    SELECT user_id, friend_id, friend_region, public_info
    FROM "Friends" AS f
    WHERE
      deleted_at IS NULL AND
      user_id = $${idx++}::uuid
    ORDER BY created_at
    OFFSET $${idx++}::int LIMIT $${idx++}::int;
    `,
    [
      accountIdentity.uid,
      skip,
      limit
    ])
}

/**
 * [跨區域操作時],[也有機會使用]
 * TODO: 加入朋友的情境(需要 UPDATE)：
 * 在同區域時,會增加兩筆紀錄; 在不同區域時只會增加一筆. (雙邊區域中各增加一筆)
 * softDelete: 跨區域操作時使用，若雙邊操作[加入朋友]-[僅有一邊成功]，成功的那邊要將 softDelete 設為 timestamp (true), 表示未成功加入朋友；
 * 使得有機會透過 rollback 補教。等雙邊都 commit 成功再將 softDelete 設定為 null (false)
 * @param {{ uid: string, region: string }} accountIdentity
 * @param {{ uid: string, region: string }} targetAccountIdentity
 * @param {Object} publicInfo
 * @return {Object|null} updatedFriend
 */
FriendRepository.prototype.updateFriend = async function (accountIdentity, targetAccountIdentity, publicInfo) {
  let idx = 1
  return this.query(
    `
    UPDATE "Friends"
    SET
      public_info = $${idx++}::jsonb
    WHERE
      user_id = $${idx++}::uuid AND
      friend_id = $${idx++}::uuid AND
      friend_region = $${idx++}::varchar
    RETURNING *;
    `,
    [
      JSON.stringify(publicInfo),
      accountIdentity.uid,
      targetAccountIdentity.uid,
      targetAccountIdentity.region
    ],
    0)
}

/**
 * [跨區域操作時使用]
 * TODO: 在同區域時,會刪除兩筆紀錄; 在不同區域時只會刪除一筆. (雙邊區域中各刪除一筆)
 * softDelete: 跨區域操作時使用，若雙邊操作需要 rollback 有機會補教。等雙邊都 commit 再硬刪除 (hard delete)
 * @param {{ uid: string, region: string }} accountIdentity
 * @param {{ uid: string, region: string }} targetAccountIdentity
 * @param {boolean} softDelete
 * @return {Object|null} deletedFriend
 */
FriendRepository.prototype.removeFriend = async function (accountIdentity, targetAccountIdentity, softDelete = false) {
  let idx = 1
  const operation = softDelete === true ? `UPDATE "Friends" SET deleted_at = NOW() AT time zone 'utc'` : 'DELETE FROM "Friends"'
  return this.query(
    `
    ${operation}
    WHERE 
      user_id = $${idx++}::uuid AND
      friend_id = $${idx++}::uuid AND
      friend_region = $${idx++}::varchar
    RETURNING *;
    `,
    [
      accountIdentity.uid,
      targetAccountIdentity.uid,
      targetAccountIdentity.region
    ],
    0)
}

module.exports = FriendRepository

const util = require('util')
const _ = require('lodash')
const pool = require('config').database.pool
const Repository = require('../../../library/repository')

util.inherits(FriendRepository, Repository)

function FriendRepository (pool) {
  this.pool = pool
}

/**
 * [NOTE]
 * [targetUserInfo] at least includes { uid, region } (must have),
 * but may alse inclues { givenName, familyName, fullName(option), profilePic, profileLink } [同區域/跨區域操作皆需要如此]
 * @param {{ uid: string, region: string }} account
 * @param {Object} targetUserInfo
 * @return {Object|null} friend
 */
FriendRepository.prototype.addFriend = async function (account, targetUserInfo) {
  let idx = 1
  const publicInfo = _.omit(targetUserInfo, ['uid', 'region'])

  return this.query(
    `
    INSERT INTO "Friends" (user_id, friend_id, friend_region, public_info, deleted_at)
    VALUES
    ($${idx++}::uuid, $${idx++}::uuid, $${idx++}::varchar, $${idx++}::jsonb, $${idx++}::timestamp) 
    RETURNING user_id AS uid, friend_id, friend_region, public_info;
    `,
    [
      account.uid,
      targetUserInfo.uid,
      targetUserInfo.region,
      JSON.stringify(publicInfo),
      null
    ],
    0)
}

/**
 * [NOTE] make friends from each other. [insert-2-records] [同區域操作時使用]
 * [userInfo/targetUserInfo] at least includes { uid, region } (must have),
 * but may alse inclues { givenName, familyName, fullName(option), profilePic, profileLink } [同區域/跨區域操作皆需要如此]
 * @param {Object} userInfo
 * @param {Object} targetUserInfo
 * @return {Object[]} friends (return array with 2 records)
 */
FriendRepository.prototype.makeFriends = async function (userInfo, targetUserInfo) {
  let idx = 1
  const userPublicInfo = _.omit(userInfo, ['uid', 'region'])
  const targetPublicInfo = _.omit(targetUserInfo, ['uid', 'region'])

  return this.query(
    `
    INSERT INTO "Friends" (user_id, friend_id, friend_region, public_info, deleted_at)
    VALUES 
    ($${idx++}::uuid, $${idx++}::uuid, $${idx++}::varchar, $${idx++}::jsonb, $${idx++}::timestamp),
    ($${idx++}::uuid, $${idx++}::uuid, $${idx++}::varchar, $${idx++}::jsonb, $${idx++}::timestamp)
    RETURNING user_id AS uid, friend_id, friend_region, public_info;
    `,
    [
      userInfo.uid,
      targetUserInfo.uid,
      targetUserInfo.region,
      JSON.stringify(targetPublicInfo),
      null,

      targetUserInfo.uid,
      userInfo.uid,
      userInfo.region,
      JSON.stringify(userPublicInfo),
      null
    ])
}

/**
 * @param {{ uid: string, region: string }} account
 * @param {{ uid: string, region: string }} targetAccount
 * @return {Object|null} friend
 */
FriendRepository.prototype.getFriend = async function (account, targetAccount) {
  let idx = 1
  return this.query(
    `
    SELECT user_id AS uid, category, friend_id, friend_region, public_info
    FROM "Friends"
    WHERE
      deleted_at IS NULL AND
      user_id = $${idx++}::uuid AND
      friend_id = $${idx++}::uuid AND
      friend_region = $${idx++}::varchar;
    `,
    [
      account.uid,
      targetAccount.uid,
      targetAccount.region
    ],
    0)
}

/**
 * @param {{ uid: string, region: string }} account
 * @param {number} limit
 * @param {number} skip
 * @return {Object[]} friend list
 */
FriendRepository.prototype.getFriendList = async function (account, limit, skip) {
  let idx = 1
  return this.query(
    `
    SELECT user_id AS uid, category, friend_id, friend_region, public_info
    FROM "Friends"
    WHERE
      deleted_at IS NULL AND
      user_id = $${idx++}::uuid
    ORDER BY created_at
    OFFSET $${idx++}::int LIMIT $${idx++}::int;
    `,
    [
      account.uid,
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
 * @param {{ uid: string, region: string }} account
 * @param {{ uid: string, region: string }} targetAccount
 * @param {Object} publicInfo
 * @return {Object|null} updatedFriend
 */
FriendRepository.prototype.updateFriend = async function (account, targetAccount, publicInfo) {
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
    RETURNING user_id AS uid, friend_id, friend_region, public_info;
    `,
    [
      JSON.stringify(publicInfo),
      account.uid,
      targetAccount.uid,
      targetAccount.region
    ],
    0)
}

/**
 * [跨區域操作時使用]
 * [NOTE]: 在同區域時,會刪除兩筆紀錄; 在不同區域時只會刪除一筆. (雙邊區域中各刪除一筆)
 * softDelete: 跨區域操作時使用，若雙邊操作需要 rollback 有機會補教。等雙邊都 commit 再硬刪除 (hard delete)
 * @param {{ uid: string, region: string }} account
 * @param {{ uid: string, region: string }} targetAccount
 * @param {boolean} softDelete
 * @return {Object|null} deletedFriend
 */
FriendRepository.prototype.removeFriend = async function (account, targetAccount, softDelete = false) {
  let idx = 1
  const operation = softDelete === true ? `UPDATE "Friends" SET deleted_at = NOW() AT time zone 'utc'` : 'DELETE FROM "Friends"'
  return this.query(
    `
    ${operation}
    WHERE 
      user_id = $${idx++}::uuid AND
      friend_id = $${idx++}::uuid AND
      friend_region = $${idx++}::varchar
    RETURNING user_id AS uid, friend_id, friend_region, public_info;
    `,
    [
      account.uid,
      targetAccount.uid,
      targetAccount.region
    ],
    0)
}

/**
 * remove friends from each other. [delete-2-records] [同區域操作時使用]
 * [NOTE]: 在同區域時,會刪除兩筆紀錄; 在不同區域時只會刪除一筆. (雙邊區域中各刪除一筆)
 * softDelete: 跨區域操作時使用，若雙邊操作需要 rollback 有機會補教。等雙邊都 commit 再硬刪除 (hard delete)
 * @param {{ uid: string, region: string }} account
 * @param {{ uid: string, region: string }} targetAccount
 * @param {boolean} softDelete
 * @return {Object[]} friends (return array with 2 records)
 */
FriendRepository.prototype.unfriend = async function (account, targetAccount, softDelete = false) {
  let idx = 1
  const operation = softDelete === true ? `UPDATE "Friends" SET deleted_at = NOW() AT time zone 'utc'` : 'DELETE FROM "Friends"'
  return this.query(
    `
    ${operation}
    WHERE 
      (
        user_id = $${idx++}::uuid AND
        friend_id = $${idx++}::uuid AND
        friend_region = $${idx++}::varchar
      )
      OR
      (
        user_id = $${idx++}::uuid AND
        friend_id = $${idx++}::uuid AND
        friend_region = $${idx++}::varchar
      )
    RETURNING user_id AS uid, friend_id, friend_region, public_info;
    `,
    [
      account.uid,
      targetAccount.uid,
      targetAccount.region,
      targetAccount.uid,
      account.uid,
      account.region
    ])
}

module.exports = {
  friendRepository: new FriendRepository(pool),
  FriendRepository
}

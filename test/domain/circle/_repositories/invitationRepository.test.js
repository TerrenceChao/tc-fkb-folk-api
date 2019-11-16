const { expect } = require('chai')
const path = require('path')
const config = require('config')
const Repository = require(path.join(config.src.library, 'Repository'))
const { AuthRepository } = require(path.join(config.src.repository.user, 'authRepository'))
const { InvitationRepository } = require(path.join(config.src.repository.circle, 'invitationRepository'))
const { genSignupInfo, genDBInvitationInfo } = require(path.join(config.test.common, 'mock'))
const { assertInvitation, sortJSONByKeys } = require(path.join(config.test.common, 'assert'))

const pool = config.database.pool

describe('repository: Invitations', () => {
  const repo = new Repository(pool)
  const authRepo = new AuthRepository(pool)
  const invitationRepo = new InvitationRepository(pool)

  var userA
  const signupInfoA = genSignupInfo()
  var userB
  const signupInfoB = genSignupInfo()

  before(async () => {
    userA = await authRepo.createAccountUser(signupInfoA)
    userB = await authRepo.createAccountUser(signupInfoB)
  })

  it('findOrCreateFriendInvitation', async () => {
    // arrange
    const inviter = { uid: userA.uid, region: userA.region }
    const recipient = { uid: userB.uid, region: userB.region }
    const event = 'invite_event_friend_invite'
    const info = genDBInvitationInfo(userA, userB)

    // act
    const invitation = await invitationRepo.createOrUpdateInvitation(inviter, recipient, event, info)

    // assert
    expect(invitation.inviter_id).to.equals(userA.uid)
    expect(invitation.inviter_region).to.equals(userA.region)
    expect(invitation.recipient_id).to.equals(userB.uid)
    expect(invitation.recipient_region).to.equals(userB.region)
    expect(invitation.event).to.equals(event)
    expect(invitation.info).to.deep.equal(sortJSONByKeys(info))
  })

  it('create invitation with duplicate unique key', async () => {
    // arrange
    const inviter = { uid: userA.uid, region: userA.region }
    const recipient = { uid: userB.uid, region: userB.region }
    const event = 'invite_event_friend_invite'
    const info = genDBInvitationInfo(userA, userB)

    // act
    const invitation = await invitationRepo.createOrUpdateInvitation(inviter, recipient, event, info)
    const newInvitation = await invitationRepo.createOrUpdateInvitation(inviter, recipient, event, info)

    // assert
    expect(newInvitation.inviter_id).to.equals(inviter.uid)
    expect(newInvitation.inviter_region).to.equals(inviter.region)
    expect(newInvitation.recipient_id).to.equals(recipient.uid)
    expect(newInvitation.recipient_region).to.equals(recipient.region)
    expect(newInvitation.event).to.equals(event)
    expect(sortJSONByKeys(newInvitation.info)).to.deep.equal(sortJSONByKeys(info))
    // 'iid' is still the same.
    expect(newInvitation.iid).to.equals(invitation.iid)
  })

  it('getSentInvitationList', async () => {
    // arrange
    const sourceInvitation = await repo.query('SELECT * FROM "Invitations" LIMIT 1', [], 0)
    const inviter = { uid: sourceInvitation.inviter_id, region: sourceInvitation.inviter_region }

    // act
    const invitationList = await invitationRepo.getSentInvitationList(inviter, 100)

    // assert
    invitationList.forEach(target => {
      expect(target.inviter_id).to.equals(inviter.uid)
      expect(target.inviter_region).to.equals(inviter.region)
    })
  })

  it('getReceivedInvitationList', async () => {
    // arrange
    const sourceInvitation = await repo.query('SELECT * FROM "Invitations" LIMIT 1', [], 0)
    const recipient = { uid: sourceInvitation.recipient_id, region: sourceInvitation.recipient_region }

    // act
    const invitationList = await invitationRepo.getReceivedInvitationList(recipient, 100)

    // assert
    invitationList.forEach(target => {
      expect(target.recipient_id).to.equals(recipient.uid)
      expect(target.recipient_region).to.equals(recipient.region)
    })
  })

  describe('Iterator: getInvitation', async () => {
    var userC
    const signupInfoC = genSignupInfo()
    var userD
    const signupInfoD = genSignupInfo()
    const event = 'invite_event_friend_invite'
    const info = genDBInvitationInfo(signupInfoC, signupInfoD)
    var inviter
    var recipient
    var sourceInvitation
    var testCases = [
      { desc: 'test get invitation with inviter, iid' },
      { desc: 'test get invitation with inviter, event' },
      { desc: 'test get invitation with inviter, iid & event' },
      { desc: 'test get invitation with recipient, iid' },
      { desc: 'test get invitation with recipient, event' },
      { desc: 'test get invitation with recipient, iid & event' }
    ]

    before(async () => {
      userC = await authRepo.createAccountUser(signupInfoC)
      userD = await authRepo.createAccountUser(signupInfoD)
      inviter = { uid: userC.uid, region: userC.region }
      recipient = { uid: userD.uid, region: userD.region }

      sourceInvitation = await invitationRepo.createOrUpdateInvitation(inviter, recipient, event, info)
      const iid = sourceInvitation.iid
      testCases[0].params = [inviter, { iid }]
      testCases[1].params = [inviter, { event }]
      testCases[2].params = [inviter, { iid, event }]
      testCases[3].params = [recipient, { iid }]
      testCases[4].params = [recipient, { event }]
      testCases[5].params = [recipient, { iid, event }]
    })

    for (let i = 0; i < testCases.length; i++) {
      it(testCases[i].desc, async () => {
        const testCase = testCases[i]
        // arrange
        const params = testCase.params

        // act
        const targetInvitation = await invitationRepo.getInvitation(params[0], params[1])

        // assert
        assertInvitation(sourceInvitation, targetInvitation)
      })
    }

    after(async () => {
      await invitationRepo.removeRelatedInvitation(inviter, recipient)
    })
  })

  describe('Iterator: getInvitationByRoles', async () => {
    var userC
    const signupInfoC = genSignupInfo()
    var userD
    const signupInfoD = genSignupInfo()
    const event = 'invite_event_friend_invite'
    const info = genDBInvitationInfo(signupInfoC, signupInfoD)
    var inviter
    var recipient
    var sourceInvitation
    var testCases = [
      { desc: 'test get invitation (by roles) with inviter, recipient' },
      { desc: 'test get invitation (by roles) with recipient, inviter' }
    ]

    before(async () => {
      userC = await authRepo.createAccountUser(signupInfoC)
      userD = await authRepo.createAccountUser(signupInfoD)
      inviter = { uid: userC.uid, region: userC.region }
      recipient = { uid: userD.uid, region: userD.region }

      sourceInvitation = await invitationRepo.createOrUpdateInvitation(inviter, recipient, event, info)
      testCases[0].params = [inviter, recipient]
      testCases[1].params = [recipient, inviter]
    })

    for (let i = 0; i < testCases.length; i++) {
      it(testCases[i].desc, async () => {
        const testCase = testCases[i]
        // arrange
        const params = testCase.params

        // act
        const targetInvitation = await invitationRepo.getInvitationByRoles(params[0], params[1])

        // assert
        assertInvitation(sourceInvitation, targetInvitation)
      })
    }

    after(async () => {
      await invitationRepo.removeRelatedInvitation(inviter, recipient)
    })
  })

  it('remove related invitation (soft delete)', async () => {
    // arrange
    const sourceInvitation = await repo.query('SELECT * FROM "Invitations" LIMIT 1', [], 0)
    const event = sourceInvitation.event
    const inviter = { uid: sourceInvitation.inviter_id, region: sourceInvitation.inviter_region }
    const recipient = { uid: sourceInvitation.recipient_id, region: sourceInvitation.recipient_region }
    const softDelete = true

    // act
    const deletedInvitationList = await invitationRepo.removeRelatedInvitation(inviter, recipient, event, softDelete)
    const invitation = await invitationRepo.getInvitation(inviter, { event })

    // assert
    deletedInvitationList.forEach(deleted => assertInvitation(sourceInvitation, deleted))
    expect(invitation).to.be.equals(undefined)
  })

  it('removeRelatedInvitation', async () => {
    // arrange
    const sourceInvitation = await repo.query('SELECT * FROM "Invitations" LIMIT 1', [], 0)
    const event = sourceInvitation.event
    const inviter = { uid: sourceInvitation.inviter_id, region: sourceInvitation.inviter_region }
    const recipient = { uid: sourceInvitation.recipient_id, region: sourceInvitation.recipient_region }

    // act
    const deletedInvitationList = await invitationRepo.removeRelatedInvitation(inviter, recipient, event)
    const invitation = await invitationRepo.getInvitation(inviter, { event })

    // assert
    deletedInvitationList.forEach(deleted => assertInvitation(sourceInvitation, deleted))
    expect(invitation).to.be.equals(undefined)
  })
})

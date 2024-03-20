import type {MockStep} from '@kie/act-js/build/src/step-mocker/step-mocker.types';
import * as kieMockGithub from '@kie/mock-github';
import type {CreateRepositoryFile, MockGithub} from '@kie/mock-github';
import path from 'path';
import assertions from './assertions/lockDeploysAssertions';
import mocks from './mocks/lockDeploysMocks';
import ExtendedAct from './utils/ExtendedAct';
import utils from './utils/utils';

jest.setTimeout(90 * 1000);
let mockGithub: MockGithub;
const FILES_TO_COPY_INTO_TEST_REPO: CreateRepositoryFile[] = [
    ...utils.deepCopy(utils.FILES_TO_COPY_INTO_TEST_REPO),
    {
        src: path.resolve(__dirname, '..', '.github', 'workflows', 'lockDeploys.yml'),
        dest: '.github/workflows/lockDeploys.yml',
    },
];

describe('test workflow lockDeploys', () => {
    beforeAll(() => {
        // in case of the tests being interrupted without cleanup the mock repo directory may be left behind
        // which breaks the next test run, this removes any possible leftovers
        utils.removeMockRepoDir();
    });

    beforeEach(async () => {
        // create a local repository and copy required files
        mockGithub = new kieMockGithub.MockGithub({
            repo: {
                testLockDeploysWorkflowRepo: {
                    files: FILES_TO_COPY_INTO_TEST_REPO,
                },
            },
        });

        await mockGithub.setup();
    });

    afterEach(async () => {
        await mockGithub.teardown();
    });
    describe('issue labeled', () => {
        describe('label is LockCashDeploys', () => {
            describe('issue has StagingDeployCash', () => {
                describe('actor is not OSBotify', () => {
                    it('job triggered, comment left in StagingDeployCash', async () => {
                        const repoPath = mockGithub.repo.getPath('testLockDeploysWorkflowRepo') ?? '';
                        const workflowPath = path.join(repoPath, '.github', 'workflows', 'lockDeploys.yml');
                        let act = new ExtendedAct(repoPath, workflowPath);
                        act = utils.setUpActParams(
                            act,
                            // @ts-expect-error TODO: Remove this once utils (https://github.com/Expensify/App/issues/32061) is migrated to TypeScript.
                            'issues',
                            {
                                action: 'labeled',
                                type: 'labeled',
                                label: {
                                    name: '🔐 LockCashDeploys 🔐',
                                },
                                issue: {
                                    labels: [{name: 'StagingDeployCash'}],
                                },
                            },
                            {
                                OS_BOTIFY_TOKEN: 'dummy_token',
                                SLACK_WEBHOOK: 'dummy_slack_webhook',
                            },
                        );
                        act = utils.setJobRunners(
                            act,
                            {
                                lockStagingDeploys: 'ubuntu-latest',
                            },
                            workflowPath,
                        );
                        const testMockSteps: MockStep = {
                            lockStagingDeploys: mocks.LOCKDEPLOYS__LOCKSTAGINGDEPLOYS__STEP_MOCKS,
                        };
                        const result = await act.runEvent('issues', {
                            workflowFile: path.join(repoPath, '.github', 'workflows', 'lockDeploys.yml'),
                            mockSteps: testMockSteps,
                            actor: 'Dummy Author',
                            logFile: utils.getLogFilePath('lockDeploys', expect.getState().currentTestName),
                        });

                        assertions.assertlockStagingDeploysJobExecuted(result);
                    });

                    it('one step fails, comment not left in StagingDeployCash, announced failure in Slack', async () => {
                        const repoPath = mockGithub.repo.getPath('testLockDeploysWorkflowRepo') ?? '';
                        const workflowPath = path.join(repoPath, '.github', 'workflows', 'lockDeploys.yml');
                        let act = new ExtendedAct(repoPath, workflowPath);
                        act = utils.setUpActParams(
                            act,
                            // @ts-expect-error TODO: Remove this once utils (https://github.com/Expensify/App/issues/32061) is migrated to TypeScript.
                            'issues',
                            {
                                action: 'labeled',
                                type: 'labeled',
                                label: {
                                    name: '🔐 LockCashDeploys 🔐',
                                },
                                issue: {
                                    labels: [{name: 'StagingDeployCash'}],
                                },
                            },
                            {
                                OS_BOTIFY_TOKEN: 'dummy_token',
                                SLACK_WEBHOOK: 'dummy_slack_webhook',
                            },
                        );
                        act = utils.setJobRunners(
                            act,
                            {
                                lockStagingDeploys: 'ubuntu-latest',
                            },
                            workflowPath,
                        );
                        const testMockSteps: MockStep = {
                            lockStagingDeploys: mocks.LOCKDEPLOYS__LOCKSTAGINGDEPLOYS__STEP_MOCKS,
                        };
                        testMockSteps.lockStagingDeploys[1] = utils.createMockStep(
                            'Wait for staging deploys to finish',
                            'Waiting for staging deploys to finish',
                            // @ts-expect-error TODO: Remove this once utils (https://github.com/Expensify/App/issues/32061) is migrated to TypeScript.
                            'LOCKSTAGINGDEPLOYS',
                            ['GITHUB_TOKEN'],
                            [],
                            null,
                            null,
                            false,
                        );
                        const result = await act.runEvent('issues', {
                            workflowFile: path.join(repoPath, '.github', 'workflows', 'lockDeploys.yml'),
                            mockSteps: testMockSteps,
                            actor: 'Dummy Author',
                            logFile: utils.getLogFilePath('lockDeploys', expect.getState().currentTestName),
                        });

                        assertions.assertlockStagingDeploysJobFailedAfterFirstStep(result);
                    });
                });

                describe('actor is OSBotify', () => {
                    it('job not triggered, comment not left in StagingDeployCash', async () => {
                        const repoPath = mockGithub.repo.getPath('testLockDeploysWorkflowRepo') ?? '';
                        const workflowPath = path.join(repoPath, '.github', 'workflows', 'lockDeploys.yml');
                        let act = new ExtendedAct(repoPath, workflowPath);
                        act = utils.setUpActParams(
                            act,
                            // @ts-expect-error TODO: Remove this once utils (https://github.com/Expensify/App/issues/32061) is migrated to TypeScript.
                            'issues',
                            {
                                action: 'labeled',
                                type: 'labeled',
                                label: {
                                    name: '🔐 LockCashDeploys 🔐',
                                },
                                issue: {
                                    labels: [{name: 'StagingDeployCash'}],
                                },
                            },
                            {
                                OS_BOTIFY_TOKEN: 'dummy_token',
                                SLACK_WEBHOOK: 'dummy_slack_webhook',
                            },
                        );
                        act = utils.setJobRunners(
                            act,
                            {
                                lockStagingDeploys: 'ubuntu-latest',
                            },
                            workflowPath,
                        );
                        const testMockSteps: MockStep = {
                            lockStagingDeploys: mocks.LOCKDEPLOYS__LOCKSTAGINGDEPLOYS__STEP_MOCKS,
                        };
                        const result = await act.runEvent('issues', {
                            workflowFile: path.join(repoPath, '.github', 'workflows', 'lockDeploys.yml'),
                            mockSteps: testMockSteps,
                            actor: 'OSBotify',
                            logFile: utils.getLogFilePath('lockDeploys', expect.getState().currentTestName),
                        });

                        assertions.assertlockStagingDeploysJobExecuted(result, false);
                    });
                });
            });

            describe('issue does not have StagingDeployCash', () => {
                describe('actor is not OSBotify', () => {
                    it('job not triggered, comment not left in StagingDeployCash', async () => {
                        const repoPath = mockGithub.repo.getPath('testLockDeploysWorkflowRepo') ?? '';
                        const workflowPath = path.join(repoPath, '.github', 'workflows', 'lockDeploys.yml');
                        let act = new ExtendedAct(repoPath, workflowPath);
                        act = utils.setUpActParams(
                            act,
                            // @ts-expect-error TODO: Remove this once utils (https://github.com/Expensify/App/issues/32061) is migrated to TypeScript.
                            'issues',
                            {
                                action: 'labeled',
                                type: 'labeled',
                                label: {
                                    name: '🔐 LockCashDeploys 🔐',
                                },
                                issue: {
                                    labels: [{name: 'Some'}, {name: 'Other'}, {name: 'Labels'}],
                                },
                            },
                            {
                                OS_BOTIFY_TOKEN: 'dummy_token',
                                SLACK_WEBHOOK: 'dummy_slack_webhook',
                            },
                        );
                        act = utils.setJobRunners(
                            act,
                            {
                                lockStagingDeploys: 'ubuntu-latest',
                            },
                            workflowPath,
                        );
                        const testMockSteps: MockStep = {
                            lockStagingDeploys: mocks.LOCKDEPLOYS__LOCKSTAGINGDEPLOYS__STEP_MOCKS,
                        };
                        const result = await act.runEvent('issues', {
                            workflowFile: path.join(repoPath, '.github', 'workflows', 'lockDeploys.yml'),
                            mockSteps: testMockSteps,
                            actor: 'Dummy Author',
                            logFile: utils.getLogFilePath('lockDeploys', expect.getState().currentTestName),
                        });

                        assertions.assertlockStagingDeploysJobExecuted(result, false);
                    });
                });

                describe('actor is OSBotify', () => {
                    it('job not triggered, comment not left in StagingDeployCash', async () => {
                        const repoPath = mockGithub.repo.getPath('testLockDeploysWorkflowRepo') ?? '';
                        const workflowPath = path.join(repoPath, '.github', 'workflows', 'lockDeploys.yml');
                        let act = new ExtendedAct(repoPath, workflowPath);
                        act = utils.setUpActParams(
                            act,
                            // @ts-expect-error TODO: Remove this once utils (https://github.com/Expensify/App/issues/32061) is migrated to TypeScript.
                            'issues',
                            {
                                action: 'labeled',
                                type: 'labeled',
                                label: {
                                    name: '🔐 LockCashDeploys 🔐',
                                },
                                issue: {
                                    labels: [{name: 'Some'}, {name: 'Other'}, {name: 'Labels'}],
                                },
                            },
                            {
                                OS_BOTIFY_TOKEN: 'dummy_token',
                                SLACK_WEBHOOK: 'dummy_slack_webhook',
                            },
                        );
                        act = utils.setJobRunners(
                            act,
                            {
                                lockStagingDeploys: 'ubuntu-latest',
                            },
                            workflowPath,
                        );
                        const testMockSteps: MockStep = {
                            lockStagingDeploys: mocks.LOCKDEPLOYS__LOCKSTAGINGDEPLOYS__STEP_MOCKS,
                        };
                        const result = await act.runEvent('issues', {
                            workflowFile: path.join(repoPath, '.github', 'workflows', 'lockDeploys.yml'),
                            mockSteps: testMockSteps,
                            actor: 'OSBotify',
                            logFile: utils.getLogFilePath('lockDeploys', expect.getState().currentTestName),
                        });

                        assertions.assertlockStagingDeploysJobExecuted(result, false);
                    });
                });
            });
        });

        describe('label is not LockCashDeploys', () => {
            describe('issue has StagingDeployCash', () => {
                describe('actor is not OSBotify', () => {
                    it('job not triggered, comment not left in StagingDeployCash', async () => {
                        const repoPath = mockGithub.repo.getPath('testLockDeploysWorkflowRepo') ?? '';
                        const workflowPath = path.join(repoPath, '.github', 'workflows', 'lockDeploys.yml');
                        let act = new ExtendedAct(repoPath, workflowPath);
                        act = utils.setUpActParams(
                            act,
                            // @ts-expect-error TODO: Remove this once utils (https://github.com/Expensify/App/issues/32061) is migrated to TypeScript.
                            'issues',
                            {
                                action: 'labeled',
                                type: 'labeled',
                                label: {
                                    name: 'Some different label',
                                },
                                issue: {
                                    labels: [{name: 'StagingDeployCash'}],
                                },
                            },
                            {
                                OS_BOTIFY_TOKEN: 'dummy_token',
                                SLACK_WEBHOOK: 'dummy_slack_webhook',
                            },
                        );
                        act = utils.setJobRunners(
                            act,
                            {
                                lockStagingDeploys: 'ubuntu-latest',
                            },
                            workflowPath,
                        );
                        const testMockSteps: MockStep = {
                            lockStagingDeploys: mocks.LOCKDEPLOYS__LOCKSTAGINGDEPLOYS__STEP_MOCKS,
                        };
                        const result = await act.runEvent('issues', {
                            workflowFile: path.join(repoPath, '.github', 'workflows', 'lockDeploys.yml'),
                            mockSteps: testMockSteps,
                            actor: 'Dummy Author',
                            logFile: utils.getLogFilePath('lockDeploys', expect.getState().currentTestName),
                        });

                        assertions.assertlockStagingDeploysJobExecuted(result, false);
                    });
                });

                describe('actor is OSBotify', () => {
                    it('job not triggered, comment not left in StagingDeployCash', async () => {
                        const repoPath = mockGithub.repo.getPath('testLockDeploysWorkflowRepo') ?? '';
                        const workflowPath = path.join(repoPath, '.github', 'workflows', 'lockDeploys.yml');
                        let act = new ExtendedAct(repoPath, workflowPath);
                        act = utils.setUpActParams(
                            act,
                            // @ts-expect-error TODO: Remove this once utils (https://github.com/Expensify/App/issues/32061) is migrated to TypeScript.
                            'issues',
                            {
                                action: 'labeled',
                                type: 'labeled',
                                label: {
                                    name: 'Some different label',
                                },
                                issue: {
                                    labels: [{name: 'StagingDeployCash'}],
                                },
                            },
                            {
                                OS_BOTIFY_TOKEN: 'dummy_token',
                                SLACK_WEBHOOK: 'dummy_slack_webhook',
                            },
                        );
                        act = utils.setJobRunners(
                            act,
                            {
                                lockStagingDeploys: 'ubuntu-latest',
                            },
                            workflowPath,
                        );
                        const testMockSteps: MockStep = {
                            lockStagingDeploys: mocks.LOCKDEPLOYS__LOCKSTAGINGDEPLOYS__STEP_MOCKS,
                        };
                        const result = await act.runEvent('issues', {
                            workflowFile: path.join(repoPath, '.github', 'workflows', 'lockDeploys.yml'),
                            mockSteps: testMockSteps,
                            actor: 'OSBotify',
                            logFile: utils.getLogFilePath('lockDeploys', expect.getState().currentTestName),
                        });

                        assertions.assertlockStagingDeploysJobExecuted(result, false);
                    });
                });
            });

            describe('issue does not have StagingDeployCash', () => {
                describe('actor is not OSBotify', () => {
                    it('job not triggered, comment not left in StagingDeployCash', async () => {
                        const repoPath = mockGithub.repo.getPath('testLockDeploysWorkflowRepo') ?? '';
                        const workflowPath = path.join(repoPath, '.github', 'workflows', 'lockDeploys.yml');
                        let act = new ExtendedAct(repoPath, workflowPath);
                        act = utils.setUpActParams(
                            act,
                            // @ts-expect-error TODO: Remove this once utils (https://github.com/Expensify/App/issues/32061) is migrated to TypeScript.
                            'issues',
                            {
                                action: 'labeled',
                                type: 'labeled',
                                label: {
                                    name: 'Some other label',
                                },
                                issue: {
                                    labels: [{name: 'Some'}, {name: 'Other'}, {name: 'Labels'}],
                                },
                            },
                            {
                                OS_BOTIFY_TOKEN: 'dummy_token',
                                SLACK_WEBHOOK: 'dummy_slack_webhook',
                            },
                        );
                        act = utils.setJobRunners(
                            act,
                            {
                                lockStagingDeploys: 'ubuntu-latest',
                            },
                            workflowPath,
                        );
                        const testMockSteps: MockStep = {
                            lockStagingDeploys: mocks.LOCKDEPLOYS__LOCKSTAGINGDEPLOYS__STEP_MOCKS,
                        };
                        const result = await act.runEvent('issues', {
                            workflowFile: path.join(repoPath, '.github', 'workflows', 'lockDeploys.yml'),
                            mockSteps: testMockSteps,
                            actor: 'Dummy Author',
                            logFile: utils.getLogFilePath('lockDeploys', expect.getState().currentTestName),
                        });

                        assertions.assertlockStagingDeploysJobExecuted(result, false);
                    });
                });

                describe('actor is OSBotify', () => {
                    it('job not triggered, comment not left in StagingDeployCash', async () => {
                        const repoPath = mockGithub.repo.getPath('testLockDeploysWorkflowRepo') ?? '';
                        const workflowPath = path.join(repoPath, '.github', 'workflows', 'lockDeploys.yml');
                        let act = new ExtendedAct(repoPath, workflowPath);
                        act = utils.setUpActParams(
                            act,
                            // @ts-expect-error TODO: Remove this once utils (https://github.com/Expensify/App/issues/32061) is migrated to TypeScript.
                            'issues',
                            {
                                action: 'labeled',
                                type: 'labeled',
                                label: {
                                    name: 'Some other label',
                                },
                                issue: {
                                    labels: [{name: 'Some'}, {name: 'Other'}, {name: 'Labels'}],
                                },
                            },
                            {
                                OS_BOTIFY_TOKEN: 'dummy_token',
                                SLACK_WEBHOOK: 'dummy_slack_webhook',
                            },
                        );
                        act = utils.setJobRunners(
                            act,
                            {
                                lockStagingDeploys: 'ubuntu-latest',
                            },
                            workflowPath,
                        );
                        const testMockSteps: MockStep = {
                            lockStagingDeploys: mocks.LOCKDEPLOYS__LOCKSTAGINGDEPLOYS__STEP_MOCKS,
                        };
                        const result = await act.runEvent('issues', {
                            workflowFile: path.join(repoPath, '.github', 'workflows', 'lockDeploys.yml'),
                            mockSteps: testMockSteps,
                            actor: 'OSBotify',
                            logFile: utils.getLogFilePath('lockDeploys', expect.getState().currentTestName),
                        });

                        assertions.assertlockStagingDeploysJobExecuted(result, false);
                    });
                });
            });
        });
    });
});

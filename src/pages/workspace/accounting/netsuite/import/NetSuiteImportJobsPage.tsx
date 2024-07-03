import {ExpensiMark} from 'expensify-common';
import React from 'react';
import {View} from 'react-native';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import RenderHTML from '@components/RenderHTML';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateNetSuiteCrossSubsidiaryCustomersConfiguration} from '@libs/actions/connections/NetSuiteCommands';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';

const parser = new ExpensiMark();

function NetSuiteImportJobsPage({policy}: WithPolicyConnectionsProps) {
    const policyID = policy?.id ?? '-1';
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const config = policy?.connections?.netsuite?.options?.config;
    const importMappings = config?.syncOptions?.mapping;
    const importedValue = importMappings?.customers ?? importMappings?.jobs ?? CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT;

    return (
        <ConnectionLayout
            displayName={NetSuiteImportJobsPage.displayName}
            headerTitle="workspace.netsuite.import.customersOrJobs.title"
            headerSubtitle={config?.subsidiary ?? ''}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={[styles.pb2]}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
        >
            <View style={[styles.ph5, styles.flexRow, styles.mb8]}>
                <RenderHTML html={`<comment><muted-text>${parser.replace(translate(`workspace.netsuite.import.customersOrJobs.subtitle` as TranslationPaths))}</muted-text></comment>`} />
            </View>

            <View style={[styles.ph5, styles.mb8]}>
                <ToggleSettingOptionRow
                    title={translate('workspace.netsuite.import.customersOrJobs.importCustomers')}
                    isActive={config?.syncOptions?.crossSubsidiaryCustomers ?? false}
                    switchAccessibilityLabel={translate('workspace.netsuite.import.customersOrJobs.importCustomers')}
                    onToggle={(isEnabled: boolean) => {
                        updateNetSuiteCrossSubsidiaryCustomersConfiguration(policyID, isEnabled);
                    }}
                    pendingAction={config?.syncOptions?.pendingFields?.crossSubsidiaryCustomers}
                    errors={ErrorUtils.getLatestErrorField(config ?? {}, CONST.NETSUITE_CONFIG.SYNC_OPTIONS.CROSS_SUBSIDIARY_CUSTOMERS)}
                    onCloseError={() => Policy.clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.SYNC_OPTIONS.CROSS_SUBSIDIARY_CUSTOMERS)}
                />
            </View>

            <View style={[styles.ph5, styles.mb8]}>
                <ToggleSettingOptionRow
                    title={translate('workspace.netsuite.import.customersOrJobs.importJobs')}
                    isActive={config?.syncOptions?.crossSubsidiaryCustomers ?? false}
                    switchAccessibilityLabel={translate('workspace.netsuite.import.customersOrJobs.importJobs')}
                    onToggle={(isEnabled: boolean) => {
                        updateNetSuiteCrossSubsidiaryCustomersConfiguration(policyID, isEnabled);
                    }}
                    pendingAction={config?.syncOptions?.pendingFields?.crossSubsidiaryCustomers}
                    errors={ErrorUtils.getLatestErrorField(config ?? {}, CONST.NETSUITE_CONFIG.SYNC_OPTIONS.CROSS_SUBSIDIARY_CUSTOMERS)}
                    onCloseError={() => Policy.clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.SYNC_OPTIONS.CROSS_SUBSIDIARY_CUSTOMERS)}
                />
            </View>
            <View style={[styles.ph5, styles.mb8]}>
                <ToggleSettingOptionRow
                    title={translate('workspace.netsuite.import.crossSubsidiaryCustomers')}
                    isActive={config?.syncOptions?.crossSubsidiaryCustomers ?? false}
                    switchAccessibilityLabel={translate('workspace.netsuite.import.crossSubsidiaryCustomers')}
                    onToggle={(isEnabled: boolean) => {
                        updateNetSuiteCrossSubsidiaryCustomersConfiguration(policyID, isEnabled);
                    }}
                    pendingAction={config?.syncOptions?.pendingFields?.crossSubsidiaryCustomers}
                    errors={ErrorUtils.getLatestErrorField(config ?? {}, CONST.NETSUITE_CONFIG.SYNC_OPTIONS.CROSS_SUBSIDIARY_CUSTOMERS)}
                    onCloseError={() => Policy.clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.SYNC_OPTIONS.CROSS_SUBSIDIARY_CUSTOMERS)}
                />
            </View>

            <View style={[styles.mb4]}>
                <OfflineWithFeedback
                    errors={
                        ErrorUtils.getLatestErrorField(config ?? {}, CONST.NETSUITE_CONFIG.SYNC_OPTIONS.MAPPING.CUSTOMERS) ??
                        ErrorUtils.getLatestErrorField(config ?? {}, CONST.NETSUITE_CONFIG.SYNC_OPTIONS.MAPPING.JOBS)
                    }
                    errorRowStyles={[styles.ph5, styles.mt2, styles.mb4]}
                    pendingAction={config?.syncOptions?.mapping?.pendingFields?.customers ?? config?.syncOptions?.mapping?.pendingFields?.jobs}
                    onClose={() => {
                        Policy.clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.SYNC_OPTIONS.MAPPING.CUSTOMERS);
                        Policy.clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.SYNC_OPTIONS.MAPPING.JOBS);
                    }}
                >
                    <MenuItemWithTopDescription
                        description={translate('workspace.common.displayedAs')}
                        title={importedValue !== CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT ? translate(`workspace.netsuite.import.importTypes.${importedValue}.label`) : undefined}
                        shouldShowRightIcon
                        onPress={() => {
                            Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_IMPORT_JOBS.getRoute(policyID));
                        }}
                        brickRoadIndicator={!!config?.errorFields?.customers || !!config?.errorFields?.jobs ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                    />
                </OfflineWithFeedback>
            </View>
        </ConnectionLayout>
    );
}

NetSuiteImportJobsPage.displayName = 'NetSuiteImportJobsPage';

export default withPolicyConnections(NetSuiteImportJobsPage);

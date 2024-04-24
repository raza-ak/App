import React from 'react';
import useThemeStyles from '@hooks/useThemeStyles';
import ReportScreenWrapper from '@libs/Navigation/AppNavigator/ReportScreenWrapper';
import getCurrentUrl from '@libs/Navigation/currentUrl';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {PlatformStackNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';
import type {CentralPaneNavigatorParamList} from '@navigation/types';
import SearchPage from '@pages/Search/SearchPage';
import SCREENS from '@src/SCREENS';

const Stack = createPlatformStackNavigator<CentralPaneNavigatorParamList>();

const url = getCurrentUrl();
const openOnAdminRoom = url ? new URL(url).searchParams.get('openOnAdminRoom') : undefined;

type Screens = Partial<Record<keyof CentralPaneNavigatorParamList, () => React.ComponentType>>;

const settingsScreens = {
    [SCREENS.SETTINGS.WORKSPACES]: () => require('../../../../../pages/workspace/WorkspacesListPage').default as React.ComponentType,
    [SCREENS.SETTINGS.PREFERENCES.ROOT]: () => require('../../../../../pages/settings/Preferences/PreferencesPage').default as React.ComponentType,
    [SCREENS.SETTINGS.SECURITY]: () => require('../../../../../pages/settings/Security/SecuritySettingsPage').default as React.ComponentType,
    [SCREENS.SETTINGS.PROFILE.ROOT]: () => require('../../../../../pages/settings/Profile/ProfilePage').default as React.ComponentType,
    [SCREENS.SETTINGS.WALLET.ROOT]: () => require('../../../../../pages/settings/Wallet/WalletPage').default as React.ComponentType,
    [SCREENS.SETTINGS.ABOUT]: () => require('../../../../../pages/settings/AboutPage/AboutPage').default as React.ComponentType,
    [SCREENS.SETTINGS.TROUBLESHOOT]: () => require('../../../../../pages/settings/Troubleshoot/TroubleshootPage').default as React.ComponentType,
    [SCREENS.SETTINGS.SAVE_THE_WORLD]: () => require('../../../../../pages/TeachersUnite/SaveTheWorldPage').default as React.ComponentType,
} satisfies Screens;

function BaseCentralPaneNavigator() {
    const styles = useThemeStyles();
    const options: PlatformStackNavigationOptions = {
        headerShown: false,
        title: 'New Expensify',
        animation: 'slide_from_left',
        webOnly: {
            // Prevent unnecessary scrolling
            cardStyle: styles.cardStyleNavigator,
        },
    };
    return (
        <Stack.Navigator screenOptions={options}>
            <Stack.Screen
                name={SCREENS.REPORT}
                // We do it this way to avoid adding the url params to url
                initialParams={{openOnAdminRoom: openOnAdminRoom === 'true' || undefined}}
                component={ReportScreenWrapper}
            />
            <Stack.Screen
                name={SCREENS.SEARCH.CENTRAL_PANE}
                // We do it this way to avoid adding the url params to url
                component={SearchPage}
            />

            {Object.entries(settingsScreens).map(([screenName, componentGetter]) => (
                <Stack.Screen
                    key={screenName}
                    name={screenName as keyof Screens}
                    getComponent={componentGetter}
                />
            ))}
        </Stack.Navigator>
    );
}

export default BaseCentralPaneNavigator;

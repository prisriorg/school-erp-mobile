import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.text } }}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="house.fill" md="home" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="students">
        <NativeTabs.Trigger.Label>Students</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="person.2.fill" md="people" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="attendance">
        <NativeTabs.Trigger.Label>Attendance</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="calendar" md="event" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="exams">
        <NativeTabs.Trigger.Label>Exams</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="doc.text.fill" md="assignment" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="fees">
        <NativeTabs.Trigger.Label>Fees</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="creditcard.fill" md="payments" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

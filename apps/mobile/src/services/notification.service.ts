import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { addDays } from '../utils';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Notification identifiers for credit card due dates
const CREDIT_CARD_DUE_DATE_PREFIX = 'credit-card-due-';
const CREDIT_CARD_REMINDER_PREFIX = 'credit-card-reminder-';

export interface ScheduleCreditCardNotificationParams {
  cardId: string;
  cardName: string;
  billingDate: Date;
  titleDueDay: string;
  titleReminder: string;
  bodyDueDay: string;
  bodyReminder: string;
}

/**
 * Request notification permissions from the user
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return false;
  }

  // Android requires a notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('credit-card-reminders', {
      name: 'Credit Card Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return true;
}

/**
 * Check if notification permissions are granted
 */
export async function checkNotificationPermissions(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}

/**
 * Calculate due date from billing date (billing date + 10 days)
 */
function calculateDueDate(billingDate: Date): Date {
  return addDays(billingDate, 10);
}

/**
 * Get the next occurrence of a date (if the date has passed this month, get next month's)
 */
function getNextOccurrence(date: Date): Date {
  const now = new Date();
  const targetDate = new Date(date);

  // Set to current year and month
  targetDate.setFullYear(now.getFullYear());
  targetDate.setMonth(now.getMonth());

  // If the date has already passed, move to next month
  if (targetDate <= now) {
    targetDate.setMonth(targetDate.getMonth() + 1);
  }

  return targetDate;
}

/**
 * Schedule notifications for a credit card's due date
 * - One notification one day before due date
 * - One notification on the due date
 */
export async function scheduleCreditCardNotifications(
  params: ScheduleCreditCardNotificationParams
): Promise<void> {
  const { cardId, cardName, billingDate, titleDueDay, titleReminder, bodyDueDay, bodyReminder } = params;

  // First, cancel any existing notifications for this card
  await cancelCreditCardNotifications(cardId);

  // Calculate the due date (billing date + 10 days)
  const dueDate = calculateDueDate(billingDate);

  // Get the next occurrence of the due date
  const nextDueDate = getNextOccurrence(dueDate);

  // Calculate reminder date (1 day before due date)
  const reminderDate = addDays(nextDueDate, -1);

  // Set notification time to 10:00 AM
  reminderDate.setHours(10, 0, 0, 0);
  nextDueDate.setHours(10, 0, 0, 0);

  const now = new Date();

  // Schedule reminder notification (1 day before)
  if (reminderDate > now) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: titleReminder,
        body: bodyReminder.replace('{{cardName}}', cardName),
        data: { cardId, type: 'credit-card-reminder' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: reminderDate,
      },
      identifier: `${CREDIT_CARD_REMINDER_PREFIX}${cardId}`,
    });
  }

  // Schedule due date notification
  if (nextDueDate > now) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: titleDueDay,
        body: bodyDueDay.replace('{{cardName}}', cardName),
        data: { cardId, type: 'credit-card-due' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: nextDueDate,
      },
      identifier: `${CREDIT_CARD_DUE_DATE_PREFIX}${cardId}`,
    });
  }
}

/**
 * Cancel all notifications for a specific credit card
 */
export async function cancelCreditCardNotifications(cardId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(`${CREDIT_CARD_DUE_DATE_PREFIX}${cardId}`);
  await Notifications.cancelScheduledNotificationAsync(`${CREDIT_CARD_REMINDER_PREFIX}${cardId}`);
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Get all scheduled notifications (for debugging)
 */
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  return Notifications.getAllScheduledNotificationsAsync();
}


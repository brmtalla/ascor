import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Clock, BookOpen, Star, Users, CheckCircle, Play, FileText, HelpCircle, Zap, ChevronRight, Lock } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useColors, type ThemeColors } from '@/constants/colors';
import { learnService } from '@/services/learnService';
import { LearnLesson } from '@/types';

const LESSON_ICONS: Record<string, React.ElementType> = {
  video: Play,
  article: FileText,
  quiz: HelpCircle,
  interactive: Zap,
};

export default function ModuleDetailScreen() {
  const colors = useColors();
  const styles = createStyles(colors);
  const { moduleId } = useLocalSearchParams<{ moduleId: string }>();
  const router = useRouter();
  const module = learnService.getModuleById(moduleId ?? '');

  const DIFFICULTY_COLORS = {
    beginner: colors.statusOpen,
    intermediate: colors.warning,
    advanced: colors.primary,
  } as const;

  const handleStartModule = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Starting Module', 'Module content will be available in the full version. Stay tuned!');
  }, []);

  const handleLessonPress = useCallback((lesson: LearnLesson) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (lesson.completed) {
      Alert.alert(lesson.title, `You've completed this ${lesson.type} lesson. Tap to review.`);
    } else {
      Alert.alert(lesson.title, `Ready to start this ${lesson.duration} ${lesson.type}?`, [
        { text: 'Start', onPress: () => Alert.alert('Coming Soon', 'Lesson content launching soon!') },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  }, []);

  if (!module) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Module' }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Module not found</Text>
        </View>
      </View>
    );
  }

  const diffColor = DIFFICULTY_COLORS[module.difficulty];
  const completedLessons = module.lessonsList?.filter(l => l.completed).length ?? 0;
  const totalLessons = module.lessonsList?.length ?? module.lessons;
  const progress = totalLessons > 0 ? completedLessons / totalLessons : 0;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Stack.Screen options={{ title: '' }} />

      <View style={styles.heroContainer}>
        <Image source={{ uri: module.image }} style={styles.heroImage} />
        <View style={styles.heroOverlay} />
        <View style={styles.heroContent}>
          <View style={[styles.diffBadge, { backgroundColor: diffColor + '30' }]}>
            <Text style={[styles.diffText, { color: diffColor }]}>{module.difficulty}</Text>
          </View>
          <Text style={styles.heroTitle}>{module.title}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.statsRow}>
          <View style={styles.statChip}>
            <Clock size={14} color={colors.mediumGray} />
            <Text style={styles.statText}>{module.duration}</Text>
          </View>
          <View style={styles.statChip}>
            <BookOpen size={14} color={colors.mediumGray} />
            <Text style={styles.statText}>{module.lessons} lessons</Text>
          </View>
          <View style={styles.statChip}>
            <Star size={14} color={colors.warning} fill={colors.warning} />
            <Text style={styles.statText}>{module.rating}</Text>
          </View>
          <View style={styles.statChip}>
            <Users size={14} color={colors.mediumGray} />
            <Text style={styles.statText}>{module.enrolledCount >= 1000 ? `${(module.enrolledCount / 1000).toFixed(1)}k` : module.enrolledCount}</Text>
          </View>
        </View>

        <View style={styles.authorSection}>
          <Image source={{ uri: module.authorAvatar }} style={styles.authorAvatar} />
          <View>
            <Text style={styles.authorLabel}>Instructor</Text>
            <Text style={styles.authorName}>{module.author}</Text>
          </View>
        </View>

        <Text style={styles.description}>{module.summary}</Text>

        {progress > 0 && (
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Your Progress</Text>
              <Text style={styles.progressPercent}>{Math.round(progress * 100)}%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
            </View>
            <Text style={styles.progressDetail}>{completedLessons} of {totalLessons} lessons completed</Text>
          </View>
        )}

        {module.keyTakeaways && module.keyTakeaways.length > 0 && (
          <View style={styles.takeawaysSection}>
            <Text style={styles.sectionTitle}>What You'll Learn</Text>
            {module.keyTakeaways.map((item, idx) => (
              <View key={idx} style={styles.takeawayRow}>
                <View style={styles.takeawayDot} />
                <Text style={styles.takeawayText}>{item}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.lessonsSection}>
          <Text style={styles.sectionTitle}>Lessons</Text>
          {module.lessonsList?.map((lesson, idx) => {
            const IconComp = LESSON_ICONS[lesson.type] ?? BookOpen;
            const isLocked = !lesson.completed && idx > 0 && !module.lessonsList?.[idx - 1]?.completed && !module.completed;

            return (
              <Pressable
                key={lesson.id}
                style={({ pressed }) => [
                  styles.lessonCard,
                  pressed && { backgroundColor: colors.extraLightGray },
                  lesson.completed && styles.lessonCardCompleted,
                ]}
                onPress={() => handleLessonPress(lesson)}
              >
                <View style={[
                  styles.lessonNumber,
                  lesson.completed && styles.lessonNumberCompleted,
                  isLocked && styles.lessonNumberLocked,
                ]}>
                  {lesson.completed ? (
                    <CheckCircle size={16} color={colors.white} />
                  ) : isLocked ? (
                    <Lock size={14} color={colors.mediumGray} />
                  ) : (
                    <Text style={[styles.lessonNumberText, isLocked && styles.lessonNumberTextLocked]}>
                      {idx + 1}
                    </Text>
                  )}
                </View>
                <View style={styles.lessonContent}>
                  <Text style={[styles.lessonTitle, lesson.completed && styles.lessonTitleCompleted]}>
                    {lesson.title}
                  </Text>
                  <View style={styles.lessonMeta}>
                    <IconComp size={12} color={colors.mediumGray} />
                    <Text style={styles.lessonMetaText}>{lesson.type} · {lesson.duration}</Text>
                  </View>
                </View>
                <ChevronRight size={16} color={colors.lightGray} />
              </Pressable>
            );
          })}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.startBtn,
            module.completed && styles.startBtnCompleted,
            pressed && { opacity: 0.9 },
          ]}
          onPress={handleStartModule}
        >
          <Text style={styles.startBtnText}>
            {module.completed ? 'Review Module' : progress > 0 ? 'Continue Learning' : 'Start Module'}
          </Text>
        </Pressable>

        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    color: colors.mediumGray,
  },
  heroContainer: {
    position: 'relative',
    height: 220,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  heroContent: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
  },
  diffBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 10,
  },
  diffText: {
    fontSize: 12,
    fontWeight: '700' as const,
    textTransform: 'capitalize' as const,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: colors.white,
    lineHeight: 28,
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  statText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.darkGray,
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  authorAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  authorLabel: {
    fontSize: 11,
    color: colors.mediumGray,
    fontWeight: '500' as const,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.black,
    marginTop: 1,
  },
  description: {
    fontSize: 15,
    color: colors.darkGray,
    lineHeight: 23,
    marginBottom: 20,
  },
  progressSection: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.lightGray,
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.black,
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.accent,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: colors.extraLightGray,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 6,
    backgroundColor: colors.accent,
    borderRadius: 3,
  },
  progressDetail: {
    fontSize: 12,
    color: colors.mediumGray,
    marginTop: 8,
  },
  takeawaysSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: colors.black,
    marginBottom: 14,
  },
  takeawayRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  takeawayDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.accent,
    marginTop: 6,
  },
  takeawayText: {
    fontSize: 14,
    color: colors.darkGray,
    lineHeight: 20,
    flex: 1,
  },
  lessonsSection: {
    marginBottom: 24,
  },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  lessonCardCompleted: {
    borderColor: colors.statusOpen + '30',
    backgroundColor: colors.statusOpen + '05',
  },
  lessonNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.extraLightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  lessonNumberCompleted: {
    backgroundColor: colors.statusOpen,
  },
  lessonNumberLocked: {
    backgroundColor: colors.extraLightGray,
  },
  lessonNumberText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: colors.darkGray,
  },
  lessonNumberTextLocked: {
    color: colors.mediumGray,
  },
  lessonContent: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.black,
    marginBottom: 3,
  },
  lessonTitleCompleted: {
    color: colors.darkGray,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lessonMetaText: {
    fontSize: 11,
    color: colors.mediumGray,
    fontWeight: '500' as const,
    textTransform: 'capitalize' as const,
  },
  startBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  startBtnCompleted: {
    backgroundColor: colors.accent,
  },
  startBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.white,
  },
});

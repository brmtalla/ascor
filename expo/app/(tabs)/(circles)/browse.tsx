import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useColors, type ThemeColors } from '@/constants/colors';
import CircleCard from '@/components/CircleCard';
import { circlesService } from '@/services/circlesService';
import { Circle } from '@/types';

export default function BrowseCirclesScreen() {
    const colors = useColors();
    const styles = createStyles(colors);
    const router = useRouter();

    const recruitingCircles = circlesService.getRecruitingCircles();

    const handleCirclePress = (circle: Circle) => {
        router.push(`/(circles)/${circle.id}`);
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={recruitingCircles}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <CircleCard circle={item} onPress={() => handleCirclePress(item)} />
                )}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <>
                        <Text style={styles.title}>Open Circles</Text>
                        <Text style={styles.subtitle}>Discover communities accepting new members</Text>
                    </>
                }
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={styles.emptyText}>No open circles right now</Text>
                        <Text style={styles.emptySubtext}>Check back later!</Text>
                    </View>
                }
            />
        </View>
    );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    list: {
        paddingTop: 16,
        paddingBottom: 40,
    },
    title: {
        fontSize: 22,
        fontWeight: '800' as const,
        color: colors.black,
        marginHorizontal: 16,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: colors.mediumGray,
        marginHorizontal: 16,
        marginBottom: 20,
    },
    empty: {
        alignItems: 'center',
        paddingTop: 60,
    },
    emptyText: {
        fontSize: 17,
        fontWeight: '600' as const,
        color: colors.darkGray,
    },
    emptySubtext: {
        fontSize: 14,
        color: colors.mediumGray,
        marginTop: 4,
    },
});

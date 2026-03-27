import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Send, ArrowLeft, Phone, Video } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useColors, type ThemeColors } from '@/constants/colors';
import { messageService } from '@/services/messageService';
import { DirectMessage } from '@/types';

const CURRENT_USER_ID = 'u1';

export default function ConversationScreen() {
  const colors = useColors();
  const styles = createStyles(colors);
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  const conversations = messageService.getConversations();
  const conversation = conversations.find(c => c.id === conversationId);
  const initialMessages = messageService.getMessages(conversationId ?? '');

  const [messages, setMessages] = useState<DirectMessage[]>(initialMessages);
  const [inputText, setInputText] = useState('');

  const handleSend = useCallback(() => {
    if (!inputText.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const newMsg: DirectMessage = {
      id: `dm_new_${Date.now()}`,
      conversationId: conversationId ?? '',
      senderId: CURRENT_USER_ID,
      senderUsername: '@jordanm',
      senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      content: inputText.trim(),
      timestamp: 'Just now',
      read: false,
    };

    setMessages(prev => [...prev, newMsg]);
    setInputText('');

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [inputText, conversationId]);

  const renderMessage = useCallback(({ item, index }: { item: DirectMessage; index: number }) => {
    const isMe = item.senderId === CURRENT_USER_ID;
    const prevMsg = index > 0 ? messages[index - 1] : null;
    const showAvatar = !isMe && (!prevMsg || prevMsg.senderId !== item.senderId);

    return (
      <View style={[styles.msgRow, isMe && styles.msgRowMe]}>
        {!isMe && (
          <View style={styles.msgAvatarContainer}>
            {showAvatar ? (
              <Image source={{ uri: item.senderAvatar }} style={styles.msgAvatar} />
            ) : (
              <View style={styles.msgAvatarSpacer} />
            )}
          </View>
        )}
        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
          <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>{item.content}</Text>
          <Text style={[styles.bubbleTime, isMe && styles.bubbleTimeMe]}>{item.timestamp}</Text>
        </View>
      </View>
    );
  }, [messages]);

  if (!conversation) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Messages' }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Conversation not found</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Stack.Screen
        options={{
          title: '',
          headerTitle: () => (
            <Pressable
              style={styles.headerTitle}
              onPress={() => router.push(`/user/${conversation.participantId}`)}
            >
              <Image source={{ uri: conversation.participantAvatar }} style={styles.headerAvatar} />
              <View>
                <Text style={styles.headerName}>{conversation.participantUsername}</Text>
                {conversation.isOnline && <Text style={styles.headerStatus}>Online</Text>}
              </View>
            </Pressable>
          ),
        }}
      />

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />

      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          placeholder="Type a message..."
          placeholderTextColor={colors.mediumGray}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={1000}
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />
        <Pressable
          style={({ pressed }) => [
            styles.sendBtn,
            !inputText.trim() && styles.sendBtnDisabled,
            pressed && inputText.trim() ? { opacity: 0.85 } : {},
          ]}
          onPress={handleSend}
          disabled={!inputText.trim()}
        >
          <Send size={18} color={colors.white} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
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
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  headerName: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.black,
  },
  headerStatus: {
    fontSize: 11,
    color: colors.statusOpen,
    fontWeight: '500' as const,
  },
  messageList: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
  },
  msgRow: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'flex-end',
  },
  msgRowMe: {
    flexDirection: 'row-reverse',
  },
  msgAvatarContainer: {
    marginRight: 8,
  },
  msgAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  msgAvatarSpacer: {
    width: 28,
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleMe: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
    marginLeft: 50,
  },
  bubbleThem: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  bubbleText: {
    fontSize: 15,
    color: colors.black,
    lineHeight: 21,
  },
  bubbleTextMe: {
    color: colors.white,
  },
  bubbleTime: {
    fontSize: 10,
    color: colors.mediumGray,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  bubbleTimeMe: {
    color: 'rgba(255,255,255,0.7)',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.lightGray,
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.extraLightGray,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 15,
    color: colors.black,
    maxHeight: 100,
    minHeight: 42,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: colors.lightGray,
  },
});

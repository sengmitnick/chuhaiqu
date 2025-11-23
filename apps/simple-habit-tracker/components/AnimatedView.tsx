import React, { useEffect, useRef } from 'react';
import { Animated, ViewProps } from 'react-native';

/**
 * Animated View Component with fade-in and slide-up effects
 */
interface AnimatedViewProps extends ViewProps {
  delay?: number;
  duration?: number;
  children: React.ReactNode;
}

export function FadeInView({ delay = 0, duration = 500, children, style, ...props }: AnimatedViewProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration,
      delay,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
        },
      ]}
      {...props}
    >
      {children}
    </Animated.View>
  );
}

export function SlideUpView({ delay = 0, duration = 500, children, style, ...props }: AnimatedViewProps) {
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
      {...props}
    >
      {children}
    </Animated.View>
  );
}

export function ScaleInView({ delay = 0, duration = 400, children, style, ...props }: AnimatedViewProps) {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: duration * 0.6,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
      {...props}
    >
      {children}
    </Animated.View>
  );
}

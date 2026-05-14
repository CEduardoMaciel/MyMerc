import { useRef, useEffect } from 'react';
import { Animated, Easing } from 'react-native';

export const useSplashAnimations = () => {
  const cartScale = useRef(new Animated.Value(0.1)).current;
  const cartMove = useRef(new Animated.Value(-200)).current;
  const cartShake = useRef(new Animated.Value(0)).current;
  const roadOpacity = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoTranslateY = useRef(new Animated.Value(0)).current;

  const handAnimY = useRef(new Animated.Value(-150)).current;
  const handOpacity = useRef(new Animated.Value(0)).current;
  const productAnimY = useRef(new Animated.Value(-130)).current;
  const productOpacity = useRef(new Animated.Value(0)).current;

  const loginOpacity = useRef(new Animated.Value(0)).current;
  const loginTranslateY = useRef(new Animated.Value(30)).current;
  
  const particles = useRef([...Array(12)].map(() => new Animated.ValueXY({ x: 0, y: 0 }))).current;
  const particlesOpacity = useRef(new Animated.Value(0)).current;

  const startEntranceSequence = () => {
    Animated.sequence([
      Animated.timing(roadOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(cartMove, { toValue: 20, duration: 1000, easing: Easing.bezier(0.1, 1, 0.3, 1), useNativeDriver: true }),
        Animated.timing(cartScale, { toValue: 3, duration: 1000, easing: Easing.bezier(0.1, 1, 0.3, 1), useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.timing(cartShake, { toValue: 15, duration: 50, useNativeDriver: true }),
        Animated.timing(cartShake, { toValue: -15, duration: 50, useNativeDriver: true }),
        Animated.timing(cartShake, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(cartShake, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(cartShake, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.parallel([
          Animated.timing(handOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(productOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(handAnimY, { toValue: -40, duration: 600, useNativeDriver: true }),
          Animated.timing(productAnimY, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]),
        Animated.timing(productOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.parallel([
          Animated.timing(handAnimY, { toValue: -150, duration: 500, useNativeDriver: true }),
          Animated.timing(handOpacity, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]),
      ]),
      Animated.parallel([
        Animated.timing(particlesOpacity, { toValue: 1, duration: 100, useNativeDriver: true }),
        ...particles.map((p, i) => 
          Animated.parallel([
            Animated.timing(p.x, { toValue: (i % 2 === 0 ? -1 : 1) * (Math.random() * 100 + 50), duration: 800, easing: Easing.out(Easing.exp), useNativeDriver: true }),
            Animated.timing(p.y, { toValue: -Math.random() * 100 - 20, duration: 800, easing: Easing.out(Easing.exp), useNativeDriver: true })
          ])
        ),
        Animated.sequence([
          Animated.delay(200),
          Animated.parallel([
            Animated.timing(logoOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.spring(logoScale, { toValue: 1, friction: 5, useNativeDriver: true }),
            Animated.timing(particlesOpacity, { toValue: 0, duration: 1000, useNativeDriver: true }),
          ])
        ])
      ]),
      Animated.parallel([
        Animated.timing(logoTranslateY, { toValue: -120, duration: 800, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(loginOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(loginTranslateY, { toValue: 0, duration: 600, useNativeDriver: true }),
      ])
    ]).start();
  };

  const startExitSequence = (onFinish: () => void) => {
    Animated.parallel([
      Animated.timing(loginOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(logoScale, { toValue: 1.3, duration: 400, useNativeDriver: true }),
      Animated.timing(logoOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(onFinish);
  };

  return {
    cartScale, cartMove, cartShake, roadOpacity, logoOpacity, logoScale, logoTranslateY,
    handAnimY, handOpacity, productAnimY, productOpacity,
    loginOpacity, loginTranslateY, particles, particlesOpacity,
    startEntranceSequence, startExitSequence
  };
};
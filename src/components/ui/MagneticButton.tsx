import {useRef, type ReactNode, type MouseEvent} from "react";
import {motion, useMotionValue, useSpring} from "framer-motion";

interface Props {
    children: ReactNode;
    /** 자석 효과 강도 (0–1). 기본 0.25 = 마우스 거리의 25%만큼 이동 */
    strength?: number;
    className?: string;
}

/**
 * 마우스에 미세하게 끌려오는 자석 버튼.
 *
 * 성능 가드:
 * - useState를 쓰지 않고 useMotionValue로 React 렌더 사이클 밖에서 처리.
 * - 부모는 motion.div 하나, 자식은 Button 그대로 — 추가 리렌더 없음.
 */
export function MagneticButton({children, strength = 0.25, className}: Props) {
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const springX = useSpring(x, {stiffness: 250, damping: 22, mass: 0.5});
    const springY = useSpring(y, {stiffness: 250, damping: 22, mass: 0.5});

    function handleMove(e: MouseEvent<HTMLDivElement>) {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        x.set((e.clientX - r.left - r.width / 2) * strength);
        y.set((e.clientY - r.top - r.height / 2) * strength);
    }
    function handleLeave() {
        x.set(0);
        y.set(0);
    }

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
            style={{x: springX, y: springY}}
            className={className}
        >
            {children}
        </motion.div>
    );
}

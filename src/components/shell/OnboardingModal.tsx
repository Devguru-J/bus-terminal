import {useEffect, useState} from "react";
import {useLocation} from "react-router-dom";
import {Modal} from "@/components/ui/Modal";
import {Button} from "@/components/ui/Button";
import {Icon} from "@/components/ui/Icon";

const STORAGE_KEY = "bus-terminal:onboarded";

interface Step {
    title: string;
    icon: string;
    body: string;
}

const STEPS: Step[] = [
    {
        title: "버스터미널이 뭐예요?",
        icon: "directions_bus",
        body: "터미널·에디터·셸 설정 파일을 시각적으로 만들고, 한 번에 다운로드하는 도구예요. Ghostty / Warp / iTerm2 / Neovim / Helix / Zsh / tmux 7개 도구를 지원합니다."
    },
    {
        title: "어떻게 쓰나요?",
        icon: "route",
        body: "왼쪽 사이드바에서 도구(승강장)를 골라 설정을 다듬고, 헤더의 '출발권 만들기 (설정 파일 다운로드)'를 눌러 받으세요. 기존 설정이 있다면 '환승하기 (기존 설정 가져오기)'로 옮겨올 수 있어요."
    },
    {
        title: "안심하세요",
        icon: "lock",
        body: "모든 설정은 브라우저에 저장돼요. 회원가입 없이 바로 사용할 수 있고, 로그인하면 클라우드에 스냅샷으로 보관할 수 있습니다. 새로고침해도 작업이 사라지지 않아요."
    }
];

export function OnboardingModal() {
    const location = useLocation();
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState(0);

    useEffect(() => {
        if (location.pathname === "/tools" || location.pathname === "/guide") {
            setOpen(false);
            return;
        }
        try {
            if (!localStorage.getItem(STORAGE_KEY)) setOpen(true);
        } catch {
            // localStorage 차단 → 그냥 노쇼
        }
    }, [location.pathname]);

    function close() {
        setOpen(false);
        try {
            localStorage.setItem(STORAGE_KEY, "1");
        } catch {
            // ignore
        }
    }

    function next() {
        if (step < STEPS.length - 1) setStep(step + 1);
        else close();
    }

    const current = STEPS[step];
    const isLast = step === STEPS.length - 1;

    return (
        <Modal
            open={open}
            onClose={close}
            title={current.title}
            footer={
                <div className="flex items-center justify-between w-full gap-3 flex-wrap">
                    <div className="flex gap-1.5 shrink-0" aria-label={`${step + 1} / ${STEPS.length}`}>
                        {STEPS.map((_, i) => (
                            <span
                                key={i}
                                className={`h-1.5 rounded-full transition-all ${
                                    i === step ? "w-6 bg-primary-fixed-dim" : "w-1.5 bg-white/15"
                                }`}
                            />
                        ))}
                    </div>
                    <div className="flex gap-2 shrink-0 ml-auto">
                        <Button variant="ghost" onClick={close}>
                            건너뛰기
                        </Button>
                        <Button onClick={next}>
                            {isLast ? "시작하기" : "다음"}
                        </Button>
                    </div>
                </div>
            }
        >
            <div className="flex flex-col items-center text-center py-4">
                <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-primary-fixed-dim/10 text-primary-fixed-dim">
                    <Icon name={current.icon} className="text-[32px]" />
                </div>
                <p className="text-body-md text-on-surface leading-relaxed max-w-md">
                    {current.body}
                </p>
            </div>
        </Modal>
    );
}

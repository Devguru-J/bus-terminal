import {useState} from "react";
import {Modal} from "@/components/ui/Modal";
import {Button} from "@/components/ui/Button";
import {Icon} from "@/components/ui/Icon";
import {supabase} from "@/lib/supabase";
import {useAuthStore} from "@/stores/authStore";
import {toast} from "@/stores/toastStore";
import {trackEvent} from "@/lib/analytics";

type Provider = "github" | "google";

export function AuthModal() {
    const open = useAuthStore(s => s.modalOpen);
    const onClose = useAuthStore(s => s.closeModal);
    const [email, setEmail] = useState("");
    const [busy, setBusy] = useState<Provider | "email" | null>(null);

    async function signInWithProvider(provider: Provider) {
        setBusy(provider);
        try {
            trackEvent("Auth SignIn", {provider});
            const {error} = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: window.location.origin + window.location.pathname
                }
            });
            if (error) throw error;
        }
        catch (err) {
            toast(err instanceof Error ? err.message : "로그인을 시작하지 못했어요.", "error");
            setBusy(null);
        }
    }

    async function signInWithEmail() {
        const trimmed = email.trim();
        if (!trimmed) {
            toast("이메일을 입력해 주세요.", "warn");
            return;
        }
        setBusy("email");
        try {
            trackEvent("Auth SignIn", {provider: "email"});
            const {error} = await supabase.auth.signInWithOtp({
                email: trimmed,
                options: {
                    emailRedirectTo: window.location.origin + window.location.pathname
                }
            });
            if (error) throw error;
            toast("로그인 링크를 이메일로 보냈어요.", "success");
            onClose();
        }
        catch (err) {
            toast(err instanceof Error ? err.message : "로그인 링크 전송에 실패했어요.", "error");
        }
        finally {
            setBusy(null);
        }
    }

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="계정 연결"
            description="로그인하면 현재 브라우저에 있는 설정을 클라우드 스냅샷으로 저장하고, 다른 기기에서 다시 불러올 수 있습니다."
            footer={
                <Button variant="ghost" onClick={onClose}>
                    닫기
                </Button>
            }
        >
            <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => signInWithProvider("github")}
                        disabled={busy !== null}
                        aria-busy={busy === "github"}
                        className="group relative h-11 inline-flex items-center justify-center gap-2.5 rounded-lg bg-[#1a1f24] px-4 text-[13px] font-semibold tracking-[-0.005em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_1px_0_rgba(0,0,0,0.4)] ring-1 ring-white/10 transition hover:bg-[#21272d] hover:ring-white/15 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fixed-dim"
                    >
                        {busy === "github" ? (
                            <Icon name="progress_activity" className="text-[18px] animate-spin" />
                        ) : (
                            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] fill-current">
                                <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2.1c-3.2.7-3.87-1.36-3.87-1.36-.52-1.34-1.28-1.69-1.28-1.69-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.18 1.18.92-.26 1.91-.39 2.9-.39.99 0 1.98.13 2.9.39 2.21-1.49 3.18-1.18 3.18-1.18.63 1.58.23 2.75.11 3.04.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.13v3.16c0 .31.21.67.8.55C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
                            </svg>
                        )}
                        <span>GitHub로 계속</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => signInWithProvider("google")}
                        disabled={busy !== null}
                        aria-busy={busy === "google"}
                        className="group relative h-11 inline-flex items-center justify-center gap-2.5 rounded-lg bg-white px-4 text-[13px] font-semibold tracking-[-0.005em] text-[#1f1f1f] shadow-[0_1px_2px_rgba(0,0,0,0.25)] ring-1 ring-black/[0.08] transition hover:bg-[#f7f8fa] hover:ring-black/[0.14] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fixed-dim"
                    >
                        {busy === "google" ? (
                            <Icon name="progress_activity" className="text-[18px] animate-spin text-[#1f1f1f]" />
                        ) : (
                            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px]">
                                <path
                                    fill="#4285F4"
                                    d="M23.5 12.27c0-.79-.07-1.55-.2-2.27H12v4.51h6.47c-.28 1.49-1.12 2.75-2.39 3.6v3h3.86c2.26-2.08 3.56-5.14 3.56-8.84z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.86-3c-1.07.72-2.45 1.16-4.08 1.16-3.14 0-5.8-2.12-6.75-4.97H1.27v3.09C3.24 21.3 7.31 24 12 24z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.25 14.28A7.21 7.21 0 0 1 4.86 12c0-.79.14-1.56.39-2.28V6.63H1.27A12 12 0 0 0 0 12c0 1.94.47 3.78 1.27 5.37l3.98-3.09z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.95 1.19 15.24 0 12 0 7.31 0 3.24 2.7 1.27 6.63l3.98 3.09C6.2 6.87 8.86 4.75 12 4.75z"
                                />
                            </svg>
                        )}
                        <span>Google로 계속</span>
                    </button>
                </div>

                <div className="rounded-lg border border-white/[0.06] bg-surface-container-lowest p-3">
                    <label className="block text-[11px] font-mono uppercase tracking-[0.12em] text-on-surface-variant mb-2">
                        이메일 로그인 링크
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <input
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            type="email"
                            inputMode="email"
                            autoComplete="email"
                            placeholder="you@example.com"
                            className="h-10 flex-1 rounded border border-white/10 bg-surface px-3 text-body-sm text-on-surface outline-none focus:border-primary-fixed-dim"
                        />
                        <Button onClick={signInWithEmail} disabled={busy !== null}>
                            링크 받기
                        </Button>
                    </div>
                </div>

                <p className="text-[12px] leading-relaxed text-on-surface-variant">
                    비회원 상태에서도 모든 설정 기능을 사용할 수 있습니다. 계정은 여러 기기 백업과 복원을 위한 선택 기능입니다.
                </p>
            </div>
        </Modal>
    );
}

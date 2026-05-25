import {useState} from "react";
import {Modal} from "@/components/ui/Modal";
import {Button} from "@/components/ui/Button";
import {Icon} from "@/components/ui/Icon";
import {supabase} from "@/lib/supabase";
import {useAuthStore} from "@/stores/authStore";
import {toast} from "@/stores/toastStore";

type Provider = "github" | "google";

export function AuthModal() {
    const open = useAuthStore(s => s.modalOpen);
    const onClose = useAuthStore(s => s.closeModal);
    const [email, setEmail] = useState("");
    const [busy, setBusy] = useState<Provider | "email" | null>(null);

    async function signInWithProvider(provider: Provider) {
        setBusy(provider);
        try {
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
                        className="h-11 inline-flex items-center justify-center gap-2 rounded border border-white/10 bg-[#24292f] px-4 font-mono text-[12px] font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#1f2328] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fixed-dim"
                    >
                        <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-[12px] font-black text-[#24292f]">
                            GH
                        </span>
                        GitHub로 계속
                    </button>
                    <button
                        type="button"
                        onClick={() => signInWithProvider("google")}
                        disabled={busy !== null}
                        className="h-11 inline-flex items-center justify-center gap-2 rounded border border-[#dadce0] bg-white px-4 font-mono text-[12px] font-semibold uppercase tracking-[0.08em] text-[#3c4043] transition hover:bg-[#f8fafd] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fixed-dim"
                    >
                        <span className="text-[18px] font-black leading-none">
                            <span className="text-[#4285f4]">G</span>
                            <span className="text-[#ea4335]">o</span>
                            <span className="text-[#fbbc05]">o</span>
                            <span className="text-[#4285f4]">g</span>
                            <span className="text-[#34a853]">l</span>
                            <span className="text-[#ea4335]">e</span>
                        </span>
                        Google로 계속
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

import type {DiffLine} from "@/components/platform/DiffViewer";

/**
 * 두 텍스트의 행 단위 diff.
 * LCS 기반 — 짧은 구성 파일에 적합 (O(m*n) 공간). 대용량 텍스트에는 부적합.
 *
 * 반환 형식은 좌/우 두 패널의 DiffLine 배열.
 * - 좌측(base): remove + context
 * - 우측(target): add + context
 */
export interface DiffResult {
    left: DiffLine[];
    right: DiffLine[];
    added: number;
    removed: number;
    same: number;
}

export function diffLines(baseText: string, targetText: string): DiffResult {
    const a = baseText.replace(/\r\n/g, "\n").split("\n");
    const b = targetText.replace(/\r\n/g, "\n").split("\n");

    // LCS table
    const m = a.length;
    const n = b.length;
    const dp: number[][] = Array.from({length: m + 1}, () =>
        new Array(n + 1).fill(0)
    );
    for (let i = m - 1; i >= 0; i--) {
        for (let j = n - 1; j >= 0; j--) {
            if (a[i] === b[j]) dp[i][j] = dp[i + 1][j + 1] + 1;
            else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
        }
    }

    const left: DiffLine[] = [];
    const right: DiffLine[] = [];
    let added = 0;
    let removed = 0;
    let same = 0;
    let i = 0;
    let j = 0;
    let leftN = 1;
    let rightN = 1;
    while (i < m && j < n) {
        if (a[i] === b[j]) {
            left.push({n: leftN++, type: "context", text: a[i]});
            right.push({n: rightN++, type: "context", text: b[j]});
            same++;
            i++;
            j++;
        }
        else if (dp[i + 1][j] >= dp[i][j + 1]) {
            left.push({n: leftN++, type: "remove", text: a[i]});
            right.push({n: rightN, type: "context", text: ""});
            removed++;
            i++;
        }
        else {
            left.push({n: leftN, type: "context", text: ""});
            right.push({n: rightN++, type: "add", text: b[j]});
            added++;
            j++;
        }
    }
    while (i < m) {
        left.push({n: leftN++, type: "remove", text: a[i]});
        right.push({n: rightN, type: "context", text: ""});
        removed++;
        i++;
    }
    while (j < n) {
        left.push({n: leftN, type: "context", text: ""});
        right.push({n: rightN++, type: "add", text: b[j]});
        added++;
        j++;
    }
    return {left, right, added, removed, same};
}

/** changedOnly 모드 — context 줄을 접지만, 변경 줄 주변 1줄은 유지. */
export function collapseContext(result: DiffResult, keepAround: number = 1): DiffResult {
    const len = result.left.length;
    const keep = new Array(len).fill(false);
    for (let k = 0; k < len; k++) {
        if (
            result.left[k].type !== "context" ||
            result.right[k].type !== "context"
        ) {
            for (let r = Math.max(0, k - keepAround); r <= Math.min(len - 1, k + keepAround); r++) {
                keep[r] = true;
            }
        }
    }
    const left: DiffLine[] = [];
    const right: DiffLine[] = [];
    for (let k = 0; k < len; k++) {
        if (keep[k]) {
            left.push(result.left[k]);
            right.push(result.right[k]);
        }
    }
    return {...result, left, right};
}

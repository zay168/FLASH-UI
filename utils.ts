/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

// Simple line-by-line diff to identify changed line numbers
export const computeDiffLines = (oldText: string, newText: string): number[] => {
    const oldLines = oldText.split('\n');
    const newLines = newText.split('\n');
    const changedLines: number[] = [];

    // Heuristic: If length is vastly different, mark all as changed
    if (Math.abs(oldLines.length - newLines.length) > oldLines.length * 0.5) {
        return newLines.map((_, i) => i + 1);
    }

    // Line by line comparison
    for (let i = 0; i < newLines.length; i++) {
        // If line is new (beyond old length) or different from old
        if (i >= oldLines.length || oldLines[i].trim() !== newLines[i].trim()) {
            changedLines.push(i + 1);
        }
    }
    return changedLines;
};
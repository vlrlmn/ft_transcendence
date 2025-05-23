import { Player, PendingMatch } from '../types';

export function getDynamicWindow(player: Player): number {
    const elapsed = Date.now() - player.joinedAt;
    return 100 + Math.floor(elapsed / 5000) * 100;
}

export function isWithinMatchWindow(player1: Player, player2: Player, window: number): boolean {
    return Math.abs(player1.mmr - player2.mmr) <= window;
}

export function createMatch(player1: Player, player2: Player, timeoutMs: number): PendingMatch {
    const createdAt = Date.now();
    const timeLeft = Math.floor(timeoutMs / 1000);

    player1.socket.send(JSON.stringify({ type: 'match_found', timeLeft }));
    player2.socket.send(JSON.stringify({ type: 'match_found', timeLeft }));

    return {
        isActive: false,
        player1,
        player2,
        confirmations: {
            [player1.id]: false,
            [player2.id]: false
        },
        createdAt
    };
}

export function evaluateMatchTimeout(
        match: PendingMatch, 
        now: number, 
        timeout: number, 
        requeue: (p: Player) => void
    ): boolean {

    const expired = now - match.createdAt > timeout;
    if (expired) {

        const p1Confirmed = match.confirmations[match.player1.id];
        const p2Confirmed = match.confirmations[match.player2.id];

        if (match.player1.socket.readyState === 1) {
          match.player1.socket.send(JSON.stringify({ type: 'match_timeout' }));
        }
        if (match.player2.socket.readyState === 1) {
          match.player2.socket.send(JSON.stringify({ type: 'match_timeout' }));
        }
    
        const nowTime = Date.now();
        if (p1Confirmed) { match.player1.joinedAt = nowTime; requeue(match.player1); }
        if (p2Confirmed) { match.player2.joinedAt = nowTime; requeue(match.player2); }
    
        return false;
    }
    return true;
}
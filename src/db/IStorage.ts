import 'fastify'
import { Match} from "../../src/domain/matchmaking/types"
export interface IStorage {
    updateRatingTransaction(updates: { id: number; rating: number; }[]): void;
    getMatchesForUser(userId: number, page: number): Match[];
    addMatch(mode: number, participants: number[]) : number;
    getPlayer(id: number) : any ;
    close() : void;
    testRequestToDB(): Promise<string>;
    addParticipant(matchId: number, userId: number): void;
};

export default IStorage
import { useState, useCallback, useMemo } from 'react';
import { PollSticker } from '../types/story';
import { voteOnPoll, calculatePollPercentages, hasUserVoted } from '../utils/pollUtils';

/**
 * usePollVote encapsulates the logic for interacting with a poll sticker.
 * It handles the state of the poll, provides an interface for voting, 
 * and computes percentages for UI animations.
 * 
 * This hook is designed to be backend-agnostic, allowing for easy integration
 * with GraphQL or REST APIs in the future.
 */
export const usePollVote = (initialPoll: PollSticker) => {
  const [poll, setPoll] = useState<PollSticker>(initialPoll);

  /**
   * Performs an optimistic vote update on the local state.
   */
  const vote = useCallback((optionId: string) => {
    setPoll((currentPoll) => voteOnPoll(currentPoll, optionId));
    
    // Future integration point:
    // await api.vote(poll.id, optionId);
  }, []);

  const hasVoted = useMemo(() => hasUserVoted(poll), [poll]);

  const percentages = useMemo(() => calculatePollPercentages(poll.options), [poll.options]);

  return {
    poll,
    vote,
    hasVoted,
    percentages,
  };
};

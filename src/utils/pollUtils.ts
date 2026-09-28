import { PollOption, PollSticker } from '../types/story';

/**
 * Calculates the percentage of votes for each option in a poll.
 * Returns a mapping of option ID to percentage (0-100).
 */
export const calculatePollPercentages = (options: PollOption[]): Record<string, number> => {
  const totalVotes = options.reduce((sum, option) => sum + option.votes, 0);
  
  if (totalVotes === 0) {
    return options.reduce((acc, option) => ({ ...acc, [option.id]: 0 }), {});
  }

  const percentages: Record<string, number> = {};
  options.forEach((option) => {
    percentages[option.id] = Math.round((option.votes / totalVotes) * 100);
  });

  return percentages;
};

/**
 * Checks if a user has already voted on a poll.
 */
export const hasUserVoted = (poll: PollSticker): boolean => {
  return !!poll.selectedOptionId;
};

/**
 * Updates a poll sticker with a new vote.
 * Returns a new PollSticker object (immutable update).
 */
export const voteOnPoll = (poll: PollSticker, optionId: string): PollSticker => {
  if (hasUserVoted(poll)) return poll;

  const newOptions = poll.options.map((option) => {
    if (option.id === optionId) {
      return { ...option, votes: option.votes + 1 };
    }
    return option;
  });

  return {
    ...poll,
    options: newOptions,
    selectedOptionId: optionId,
  };
};

/**
 * Gets the option with the most votes.
 */
export const getWinningOption = (poll: PollSticker): PollOption | null => {
  if (poll.options.length === 0) return null;
  
  return poll.options.reduce((prev, current) => 
    (prev.votes > current.votes) ? prev : current
  );
};

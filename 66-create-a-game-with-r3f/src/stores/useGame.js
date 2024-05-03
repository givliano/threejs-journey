import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

// Use this store as a hook
// Components can subscribe by calling `useGame.subscribe`.
export default create(subscribeWithSelector((set) => {
  // Returns the global state
  return {
    blocksCount: 7,
    blockSeed: 0,

    /**
     * Time
     * Only startTime and endTime, the currentTime will not be stored
     */
    startTime: 0,
    endTime: 0,

    /**
    * Phases
    * Track the state of the game, `ready`, `playing` and `ended`
    */
    phase: 'ready',

    start: () => set((state) => {
      if (state.phase === 'ready') {
        return { 
          phase: 'playing',
          startTime: Date.now(),
        };
      }
      // We must always return something so by default we return an empty object that does nothing.
      return {};
    }),
    restart: () => set((state) => { 
      if (state.phase === 'playing' || state.phase === 'ended') {
        return { 
          phase: 'ready',
          blockSeed: Math.random(),
        };
      } 
      return {};
    }),
    end: () => set((state) => { 
      if (state.phase === 'playing') {
        return { 
          phase: 'ended',
          endTime: Date.now(),
        };
      }
      return {};
    }),
  };
}));

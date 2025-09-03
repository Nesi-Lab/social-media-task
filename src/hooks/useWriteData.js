import { useCallback } from 'react';
import { useInitialTime } from '../components/InitialTimeContext';
import { writeData } from '../lib/utils';

// Custom hook for writeData with automatic timestamp handling
export function useWriteData() {
    const { getRelativeTimestamp } = useInitialTime();

    const writeDataWithTimestamp = useCallback(async(table, data, participant_id) => {
        // Calculate relative timestamp from the shared timer
        const relativeTimestamp = getRelativeTimestamp();

        // Call the existing writeData function
        return writeData(table, data, participant_id, relativeTimestamp);
    }, [getRelativeTimestamp]);

    return writeDataWithTimestamp;
}

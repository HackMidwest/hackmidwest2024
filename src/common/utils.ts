export const shuffleArray = <T>(arr: T[]): T[] => {
  const shuffled = [...arr]; // Copy the array to avoid mutating the original
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Swap elements
  }
  return shuffled;
};

export const splitIntoChunks =
  (n: number) =>
  <T>(array: T[]): T[][] => {
    // Calculate the size of each chunk
    const chunkSize = Math.ceil(array.length / n);

    // Create an array to hold the chunks
    const chunks: T[][] = [];

    for (let i = 0; i < n; i++) {
      // Slice the array to create chunks and push them into the chunks array
      const chunk = array.slice(i * chunkSize, i * chunkSize + chunkSize);
      if (chunk.length > 0) {
        chunks.push(chunk);
      }
    }

    return chunks;
  };

export function updateElementInArray<T>(
  array: T[],
  updater: (element: T) => T,
  predicate: (element: T) => boolean,
): T[] {
  return array.map(element => {
    // Check if the current element matches the predicate
    if (predicate(element)) {
      // Update the element using the updater function if it matches
      return updater(element);
    }
    // Return the original element if it doesn't match
    return element;
  });
}

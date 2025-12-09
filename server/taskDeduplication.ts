
/**
 * Task Deduplication Utility
 * 
 * Ensures that no two identical tasks appear consecutively.
 * Used across all task generators (training, games, etc.)
 */

export interface TaskSignature {
  number1: number;
  number2: number;
  operation: '+' | '-';
  placeholderPosition?: string;
}

/**
 * Check if two tasks are identical
 */
export function areTasksIdentical(task1: TaskSignature | null, task2: TaskSignature): boolean {
  if (!task1) return false;
  
  return (
    task1.number1 === task2.number1 &&
    task1.number2 === task2.number2 &&
    task1.operation === task2.operation &&
    (task1.placeholderPosition || 'end') === (task2.placeholderPosition || 'end')
  );
}

/**
 * Generate a unique task that is different from the previous one
 * Uses retry logic with max attempts to prevent infinite loops
 */
export function ensureUniqueTa<T extends TaskSignature>(
  generateFn: () => T,
  previousTask: TaskSignature | null,
  maxAttempts: number = 50
): T {
  let attempts = 0;
  let task: T;
  
  do {
    task = generateFn();
    attempts++;
    
    if (attempts >= maxAttempts) {
      console.warn('⚠️ Max attempts reached for task deduplication. Returning task anyway.');
      break;
    }
  } while (areTasksIdentical(previousTask, task));
  
  return task;
}

/**
 * Create a task signature for comparison
 */
export function createTaskSignature(task: any): TaskSignature {
  return {
    number1: task.number1,
    number2: task.number2,
    operation: task.operation,
    placeholderPosition: task.placeholderPosition || task.placeholderInSymbolic || 'end'
  };
}

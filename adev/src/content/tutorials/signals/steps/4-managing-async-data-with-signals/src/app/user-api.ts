// Mock API function for loading user data
export async function loadUser(id: number): Promise<{name: string; email: string}> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simulate potential errors
  if (id === 999) {
    throw new Error('User not found');
  }

  return {
    name: `User ${id}`,
    email: `user${id}@example.com`,
  };
}

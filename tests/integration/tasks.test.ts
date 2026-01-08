import { SELF } from "cloudflare:test";
import { describe, expect, it, beforeAll } from "vitest";

// Helper to create a task and return the full task object
async function createTask(taskData: any) {
	const response = await SELF.fetch(`http://local.test/tasks`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(taskData),
	});
	const body = await response.json<{
		success: boolean;
		result: any;
	}>();
	return body.result;
}

describe("Task API Integration Tests", () => {
	// Clean up the database before all tests run
	beforeAll(async () => {
		const response = await SELF.fetch(`http://local.test/tasks`);
		const body = await response.json<{ success: boolean; result: any[] }>();
		if (body.success && body.result.length > 0) {
			const deletePromises = body.result.map((task: any) =>
				SELF.fetch(`http://local.test/tasks/${task.slug}`, {
					method: "DELETE",
				}),
			);
			await Promise.all(deletePromises);
		}
	});

	// Tests for GET /tasks
	describe("GET /tasks", () => {
		it("should get an empty list of tasks initially", async () => {
			const response = await SELF.fetch(`http://local.test/tasks`);
			const body = await response.json<{ success: boolean; result: any[] }>();

			expect(response.status).toBe(200);
			expect(body.success).toBe(true);
			// The `TaskRead` endpoint is not provided, but we assume it returns an array in `result`.
			// The array might contain data from previous test runs if not cleaned, so we check for array type.
			expect(body.result).toBeInstanceOf(Array);
		});
	});

	// Tests for POST /tasks
	describe("POST /tasks", () => {
		it("should create a new task successfully", async () => {
			const taskData = {
				name: "New Task",
				slug: "new-task-1",
				description: "A brand new task",
				due_date: "2025-12-31",
			};
			const response = await SELF.fetch(`http://local.test/tasks`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(taskData),
			});

			const body = await response.json<{ success: boolean; result: any }>();

			expect(response.status).toBe(201);
			expect(body.success).toBe(true);
			expect(body.result).toEqual(
				expect.objectContaining({
					id: expect.any(Number),
					name: "New Task",
					slug: "new-task-1",
					completed: 0,
				}),
			);
		});

		it("should return a 400 error for invalid input (missing name)", async () => {
			const invalidTaskData = {
				slug: "invalid-task",
				description: "This is an invalid task",
			};
			const response = await SELF.fetch(`http://local.test/tasks`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(invalidTaskData),
			});

			expect(response.status).toBe(400);
			const body = await response.json();
			expect(body.success).toBe(false);
		});

		it("should create a new task with null description and due_date", async () => {
			const taskData = {
				name: "Task with nulls",
				slug: "task-with-nulls",
			};
			const response = await SELF.fetch(`http://local.test/tasks`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(taskData),
			});
	
			const body = await response.json<{ success: boolean; result: any }>();
	
			expect(response.status).toBe(201);
			expect(body.success).toBe(true);
			expect(body.result).toEqual(
				expect.objectContaining({
					id: expect.any(Number),
					name: "Task with nulls",
					slug: "task-with-nulls",
					description: null,
					due_date: null,
					completed: 0,
				}),
			);
		});

		it("should return a 500 error for duplicate slug", async () => {
			const taskData = {
				name: "Task with duplicate slug",
				slug: "new-task-1",
				description: "A brand new task",
				due_date: "2025-12-31",
			};
			const response = await SELF.fetch(`http://local.test/tasks`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(taskData),
			});
		
			expect(response.status).toBe(500);
		});
	});

	// Tests for single task operations
	describe("GET, PUT, DELETE /tasks/:slug", () => {
		let task: any;

		beforeAll(async () => {
			// Create a task to be used in these tests
			task = await createTask({
				name: "Specific Task",
				slug: "specific-task-for-ops",
				description: "A task to be fetched, updated, and deleted",
				due_date: "2025-06-01",
			});
		});

		it("should get a single task by its slug", async () => {
			const response = await SELF.fetch(`http://local.test/tasks/${task.slug}`);
			const body = await response.json<{ success: boolean; result: any }>();

			expect(response.status).toBe(200);
			expect(body.success).toBe(true);
			expect(body.result.id).toBe(task.id);
			expect(body.result.slug).toBe(task.slug);
		});

		it("should return a 404 error if task slug is not found for GET", async () => {
			const response = await SELF.fetch(`http://local.test/tasks/non-existent-slug`);
			expect(response.status).toBe(404);
			const body = await response.json();
			expect(body.success).toBe(false);
			expect(body.error).toBe("Not Found");
		});

		it("should update a task successfully", async () => {
			const updatedData = {
				name: "Updated Task Name",
				completed: true,
			};

			const response = await SELF.fetch(`http://local.test/tasks/${task.slug}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(updatedData),
			});
			const body = await response.json<{ success: boolean; result: any }>();

			expect(response.status).toBe(200);
			expect(body.success).toBe(true);
			expect(body.result.name).toBe("Updated Task Name");
			expect(body.result.completed).toBe(1); // DB stores boolean as 0 or 1
		});

		it("should return 404 when trying to update a non-existent task", async () => {
			const response = await SELF.fetch(`http://local.test/tasks/non-existent-slug`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ completed: true }),
			});
			expect(response.status).toBe(404);
		});

		it("should delete a task successfully", async () => {
			// Create a task specifically for this delete test to avoid conflicts
			const taskToDelete = await createTask({
				name: "Task to Delete",
				slug: "task-to-delete",
			});

			const deleteResponse = await SELF.fetch(`http://local.test/tasks/${taskToDelete.slug}`, {
				method: "DELETE",
			});
			const deleteBody = await deleteResponse.json<{ success: boolean }>();

			expect(deleteResponse.status).toBe(200);
			expect(deleteBody.success).toBe(true);

			// Verify the task is actually deleted
			const getResponse = await SELF.fetch(`http://local.test/tasks/${taskToDelete.slug}`);
			expect(getResponse.status).toBe(404);
		});

		it("should return 404 when trying to delete a non-existent task", async () => {
			const response = await SELF.fetch(`http://local.test/tasks/non-existent-slug`, {
				method: "DELETE",
			});
			expect(response.status).toBe(404);
		});
	});
});

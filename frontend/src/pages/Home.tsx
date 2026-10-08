import React, { useEffect, useState } from "react";
import axios from "axios";

export type User = {
  id: number;
  name: string;
  email: string;
  age: number;
};

type StudentForm = {
  name: string;
  email: string;
  age: string;
};

type ModalMode = "read" | "edit";

function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<StudentForm>({
    name: "",
    email: "",
    age: "",
  });

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode | null>(null);

  const getUsers = async () => {
    try {
      setLoading(true);

      const response = await axios.get<User[]>(
        "http://localhost:8081/users"
      );

      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSaving(true);

      await axios.post("http://localhost:8081/adduser", {
        name: formData.name,
        email: formData.email,
        age: Number(formData.age),
      });

      setFormData({
        name: "",
        email: "",
        age: "",
      });

      await getUsers();
    } catch (error) {
      console.error("Error adding student:", error);
    } finally {
      setSaving(false);
    }
  };

  const openReadModal = async (id: number) => {
    try {
      const response = await axios.get<User>(
        `http://localhost:8081/getuser/${id}`
      );

      setSelectedUser(response.data);
      setModalMode("read");
    } catch (error) {
      console.error("Error fetching student:", error);
    }
  };

  const openEditModal = async (id: number) => {
    try {
      const response = await axios.get<User>(
        `http://localhost:8081/getuser/${id}`
      );

      const user = response.data;

      setSelectedUser(user);

      setFormData({
        name: user.name,
        email: user.email,
        age: String(user.age),
      });

      setModalMode("edit");
    } catch (error) {
      console.error("Error fetching student:", error);
    }
  };

  const handleSave = async () => {
    if (!selectedUser) {
      return;
    }

    try {
      setSaving(true);

      await axios.put(
        `http://localhost:8081/updateuser/${selectedUser.id}`,
        {
          name: formData.name,
          email: formData.email,
          age: Number(formData.age),
        }
      );

      await getUsers();
      closeModal();
    } catch (error) {
      console.error("Error updating student:", error);
    } finally {
      setSaving(false);
    }
  };

  const closeModal = () => {
    setSelectedUser(null);
    setModalMode(null);

    setFormData({
      name: "",
      email: "",
      age: "",
    });
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Student Management
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Add, view, and update student information.
          </p>
        </div>

        <section className="mb-8 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-5 text-xl font-semibold text-slate-900">
            Add Student
          </h2>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-5 md:grid-cols-3"
          >
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter student name"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="student@example.com"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="age"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Age
              </label>

              <input
                id="age"
                name="age"
                type="number"
                min="1"
                value={formData.age}
                onChange={handleChange}
                placeholder="Enter age"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="md:col-span-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Adding..." : "Add Student"}
              </button>
            </div>
          </form>
        </section>

        <section className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-xl font-semibold text-slate-900">
              Student List
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center px-6 py-12">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
                Loading students...
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-slate-500">
              No students found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Age
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 bg-white">
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">
                        {user.id}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-700">
                        {user.name}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-700">
                        {user.email}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-700">
                        {user.age}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openReadModal(user.id)}
                            className="rounded-md bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                          >
                            Read
                          </button>

                          <button
                            type="button"
                            onClick={() => openEditModal(user.id)}
                            className="rounded-md bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-200"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="rounded-md bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-200"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {selectedUser && modalMode && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
          onClick={closeModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="student-modal-title"
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close modal"
              onClick={closeModal}
              className="absolute right-4 top-4 rounded-md px-2 py-1 text-xl leading-none text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            >
              ×
            </button>

            {modalMode === "read" ? (
              <div>
                <h2
                  id="student-modal-title"
                  className="mb-6 text-2xl font-bold text-slate-900"
                >
                  Student Details
                </h2>

                <div className="divide-y divide-slate-200 rounded-lg border border-slate-200">
                  <div className="flex justify-between gap-4 px-4 py-3">
                    <span className="font-medium text-slate-500">ID</span>
                    <span className="text-right text-slate-900">
                      {selectedUser.id}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4 px-4 py-3">
                    <span className="font-medium text-slate-500">Name</span>
                    <span className="text-right text-slate-900">
                      {selectedUser.name}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4 px-4 py-3">
                    <span className="font-medium text-slate-500">Email</span>
                    <span className="break-all text-right text-slate-900">
                      {selectedUser.email}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4 px-4 py-3">
                    <span className="font-medium text-slate-500">Age</span>
                    <span className="text-right text-slate-900">
                      {selectedUser.age}
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-900"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h2
                  id="student-modal-title"
                  className="mb-6 text-2xl font-bold text-slate-900"
                >
                  Edit Student
                </h2>

                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    handleSave();
                  }}
                  className="space-y-5"
                >
                  <div>
                    <label
                      htmlFor="edit-name"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Name
                    </label>

                    <input
                      id="edit-name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="edit-email"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Email
                    </label>

                    <input
                      id="edit-email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="edit-age"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Age
                    </label>

                    <input
                      id="edit-age"
                      name="age"
                      type="number"
                      min="1"
                      value={formData.age}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

export default Home;
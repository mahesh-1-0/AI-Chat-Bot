import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { ChatApp } from "../App.jsx";

describe("ChatApp", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        reply: "Hello — how can I help?",
        sessionId: "test-session",
      }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends a message and renders the bot reply", async () => {
    const user = userEvent.setup();
    render(<ChatApp apiUrl="/api/chat" />);

    const input = screen.getByLabelText(/message/i);
    const sendButton = screen.getByRole("button", { name: /send/i });

    await act(async () => {
      await user.type(input, "Hello there");
      await user.click(sendButton);
    });

    await waitFor(() => expect(sendButton).toBeDisabled());

    await waitFor(() =>
      expect(
        screen.getByText(/Hello — how can I help?/i)
      ).toBeInTheDocument()
    );
  });
});


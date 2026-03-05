import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent } from "storybook/test";
import { ContactUs } from "compositions";
import { AllProviders } from "data";

const meta: Meta<typeof ContactUs> = {
  component: ContactUs,
  title: "SDS Compositions/Contact Us",
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <AllProviders><Story /></AllProviders>],
};
export default meta;

export const StoryDefault: StoryObj<typeof ContactUs> = {
  name: "Default",
  render: () => <ContactUs />,
};

export const StorySubmit: StoryObj<typeof ContactUs> = {
  name: "Submit (valid)",
  render: () => <ContactUs />,
  play: async ({ canvas }) => {
    await userEvent.type(canvas.getByLabelText("Name"), "Alice");
    await userEvent.type(canvas.getByLabelText("Surname"), "Smith");
    await userEvent.type(canvas.getByLabelText("Email"), "alice@example.com");
    await userEvent.type(canvas.getByLabelText("Message"), "Hello, I have a question.");
    await userEvent.click(canvas.getByRole("button", { name: "Submit" }));
    await expect(canvas.getByLabelText("Name")).toHaveValue("Alice");
  },
};

export const StoryInvalidEmpty: StoryObj<typeof ContactUs> = {
  name: "Submit (empty required)",
  render: () => <ContactUs />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Submit" }));
    await expect(canvas.getByLabelText("Name")).toBeInvalid();
    await expect(canvas.getByLabelText("Surname")).toBeInvalid();
    await expect(canvas.getByLabelText("Email")).toBeInvalid();
    await expect(canvas.getByLabelText("Message")).toBeInvalid();
  },
};

export const StoryInvalidEmail: StoryObj<typeof ContactUs> = {
  name: "Submit (invalid email)",
  render: () => <ContactUs />,
  play: async ({ canvas }) => {
    await userEvent.type(canvas.getByLabelText("Name"), "Alice");
    await userEvent.type(canvas.getByLabelText("Surname"), "Smith");
    await userEvent.type(canvas.getByLabelText("Email"), "not-an-email");
    await userEvent.type(canvas.getByLabelText("Message"), "Hello.");
    await userEvent.click(canvas.getByRole("button", { name: "Submit" }));
    await expect(canvas.getByLabelText("Email")).toBeInvalid();
    await expect(canvas.getByLabelText("Name")).toBeValid();
    await expect(canvas.getByLabelText("Surname")).toBeValid();
    await expect(canvas.getByLabelText("Message")).toBeValid();
  },
};

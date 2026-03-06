import { Meta, StoryObj } from "@storybook/react-vite";
import { AllProviders } from "data";
import { expect, userEvent, within } from "storybook/test";
import { ContactUs } from "../../examples/ContactUs";

const meta: Meta<typeof ContactUs> = {
  component: ContactUs,
  title: "SDS Examples/Contact Us",
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <AllProviders><Story /></AllProviders>],
};
export default meta;

export const StoryDefault: StoryObj<typeof ContactUs> = {
  name: "Default",
  render: () => <ContactUs />,
};

export const StorySubmit: StoryObj<typeof ContactUs> = {
  name: "Submit (Valid)",
  render: () => <ContactUs />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText("Name"), "John");
    await userEvent.type(canvas.getByLabelText("Surname"), "Doe");
    await userEvent.type(canvas.getByLabelText("Email"), "john@example.com");
    await userEvent.type(canvas.getByLabelText("Message"), "Hello, I would like to get in touch.");
    await userEvent.click(canvas.getByRole("button", { name: "Submit" }));
  },
};

export const StoryInvalidEmpty: StoryObj<typeof ContactUs> = {
  name: "Invalid (Empty Required)",
  render: () => <ContactUs />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Submit" }));
    await expect(canvas.getByLabelText("Name")).toBeInvalid();
  },
};

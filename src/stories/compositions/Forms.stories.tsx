import { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import { FormBox } from "compositions";
import { Button, ButtonGroup, CheckboxField, InputField } from "primitives";

const meta: Meta<typeof FormBox> = {
  component: FormBox,
  title: "SDS Compositions/Forms",
  parameters: { layout: "centered" },
};
export default meta;

export const StoryFormBox: StoryObj<typeof FormBox> = {
  name: "Forms",
  args: {
    onSubmit: fn((e: React.FormEvent) => e.preventDefault()),
  },
  render: (args) => (
    <FormBox {...args}>
      <InputField label="Email" type="email" isRequired />
      <InputField label="Password" isRequired />
      <CheckboxField label="Label" description="Description" />
      <ButtonGroup align="justify">
        <Button type="submit" variant="primary">
          Register
        </Button>
      </ButtonGroup>
    </FormBox>
  ),
  play: async ({ canvas, args }) => {
    await userEvent.type(canvas.getByLabelText("Email"), "test@example.com");
    await userEvent.type(canvas.getByLabelText("Password"), "password123");
    await userEvent.click(canvas.getByRole("button", { name: "Register" }));
    await expect(args.onSubmit).toHaveBeenCalled();
  },
};

export const InvalidEmpty: StoryObj<typeof FormBox> = {
  name: "Invalid (Empty Required)",
  args: {
    onSubmit: fn((e: React.FormEvent) => e.preventDefault()),
  },
  render: (args) => (
    <FormBox {...args}>
      <InputField label="Email" type="email" isRequired />
      <InputField label="Password" isRequired />
      <CheckboxField label="Label" description="Description" />
      <ButtonGroup align="justify">
        <Button type="submit" variant="primary">
          Register
        </Button>
      </ButtonGroup>
    </FormBox>
  ),
  play: async ({ canvas, args }) => {
    // Submit without filling any required fields
    await userEvent.click(canvas.getByRole("button", { name: "Register" }));
    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};

export const InvalidEmail: StoryObj<typeof FormBox> = {
  name: "Invalid (Bad Email)",
  args: {
    onSubmit: fn((e: React.FormEvent) => e.preventDefault()),
  },
  render: (args) => (
    <FormBox {...args}>
      <InputField label="Email" type="email" isRequired />
      <InputField label="Password" isRequired />
      <CheckboxField label="Label" description="Description" />
      <ButtonGroup align="justify">
        <Button type="submit" variant="primary">
          Register
        </Button>
      </ButtonGroup>
    </FormBox>
  ),
  play: async ({ canvas, args }) => {
    // Fill with invalid email and valid password
    await userEvent.type(canvas.getByLabelText("Email"), "not-an-email");
    await userEvent.type(canvas.getByLabelText("Password"), "password123");
    await userEvent.click(canvas.getByRole("button", { name: "Register" }));
    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};

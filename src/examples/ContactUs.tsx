import { Footer, FormBox, Header, Hero } from "compositions";
import { Button, ButtonGroup, InputField, TextContentTitle, TextareaField } from "primitives";

export function ContactUs() {
  return (
    <>
      <Header />
      <Hero variant="subtle">
        <TextContentTitle
          align="center"
          title="Contact Us"
          subtitle="Get in touch with us"
        />
        <FormBox onSubmit={(e) => e.preventDefault()}>
          <InputField label="Name" placeholder="Value" isRequired maxLength={50} />
          <InputField label="Surname" placeholder="Value" isRequired maxLength={50} />
          <InputField label="Email" placeholder="Value" type="email" isRequired maxLength={254} />
          <TextareaField label="Message" placeholder="Value" isRequired maxLength={2000} />
          <ButtonGroup align="justify">
            <Button type="submit" variant="primary">
              Submit
            </Button>
          </ButtonGroup>
        </FormBox>
      </Hero>
      <Footer />
    </>
  );
}

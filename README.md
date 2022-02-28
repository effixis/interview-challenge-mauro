# Mauro project

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

### Installation

1. Clone repository

   ```bash
   git clone https://github.com/effixis/mauro
   ```

2. Switch on working branch

   ```bash
   git checkout <branch-name>
   ```

3. Install dependencies

   ```bash
   npm install
   ```

### Run the application

- Start the development server

  ```bash
  npm run dev
  ```

## Structure

- **pages**  
  Contains all page file (ex: `login.tsx` serve path `/login`)

- **components**  
  Contains all react components

- **utils**  
  Contains files that doesn't have a specific purpose, or that
  define multiple components and/or hooks (ex: `Input.tsx`)

- **hooks**  
  Contains custom hooks

## Typescript

### Types

- General purpose types are defined in `/utils/types.tsx`
- Types specific to a component/page are defined directly in the file

### Functional component

For each component, define an interface that specify the props.

- Exemple

  ```typescript
  import { FC } from "react";

  export interface FooProps {
    title: string
  }

  const Foo: FC<FooProps> = (props) => {
    return <p>{props.title}</p>;
  };

  export default Foo;
  ```

- In case of generic interface, declare the component as a function
  (see [issue](https://stackoverflow.com/questions/51459971/type-of-generic-stateless-component-react-or-extending-generic-function-interfa))

  ```typescript
  // Optional, if needs children
  import { PropsWithChildren } from "react";

  export interface FooProps<T> {
    data: T[]
  }

  function Foo<T>(props: FooProps<T>) {
    return <p>Hello World</p>;
  }

  export default Foo;
  ```

## Imports

There is a convention on imports for consistency purposes

_Import Order_
| | | | | | |
| :--- | :---: | :--- | :---: | :--- | :---: |
| 1. | next | 4. | other external libraries | 7. | components |
| 2. | react | 5. | utils |
| 3. | material-ui | 6. | hooks |

### Material-ui

_Import Order_
| | |
| :--- | :---: |
| 1. | styles |
| 2. | components |
| 3. | icons |
| 4. | other |

- Use tree-shaking with components as it doesn't impact production
  (see [doc](https://material-ui.com/guides/minimizing-bundle-size/#when-and-how-to-use-tree-shaking))

- Don't use tree-shaking with icons as it slows down development startup times
  (see [doc](https://material-ui.com/guides/minimizing-bundle-size/#development-environment))

**Example of imports**

```typescript
// mui
import { makeStyles } from "@material-ui/core/styles";
import {
  Grid,
  TextField,
} from "@material-ui/core";

import DvrIcon from "@material-ui/icons/Dvr";

import Autocomplete from "@material-ui/lab/Autocomplete";
```

## Input.tsx

Input.tsx is a module created to facilitate the gathering and validations of inputs.
It defines three components: `useInput`, `InputProvider` and `InputField`. Each one is used
in different parts of the workflow.  

### Workflow
The general workflow idea consists of three parts:

1. Create an input object with the input data structure
2. Set criterias that the inputs values should meet
3. Validate the user inputs and display potential errors

### Example

* Example with data structure:
```typescript
{
  name: string
  age: number
  mail: string
}
```

* Create the input object
```typescript
// create an 'input' object using the useInput hook
const input = useInput({
  name: "", // defaults to ""
  age: 0, // defaults to 0
  mail: "test@example.com", // defaults to "test@..."
});
```

* Set validations criterias
```jsx
<div>
  ...
  {/* 
    InputProvider is a context provider (with value 'input')
    it is used by the InputField components
  */}
  <InputProvider value={input}>
    
    {/* InputField render a TextField component */}
    <InputField
      field="name" // specify what field is handeln
      label="Name" // put a label
    />
    
    {/* The age field must be a valid number bigger than 0*/}
    <InputField
      field="age"
      label="Age"
      type="number" // add number criteria
      min={0} // add minimum criteria
    />

    {/* Set a custom criteria on mail*/}
    <InputField
      field="mail"
      label="Mail"
      customValidation={
        (key, value) => {
          // mail must contains a '@' char
          if (value.indexOf("@") == -1) {
            return { error: true, info: "Invalid mail address." };
          } else {
            return { error: false, info: " " };
          }
        }
      }
    />
  </InputProvider>
  ...
</div>
```

* Validate the user inputs
```typescript

// example of validation on a submit callback
function onSubmit() {
  // input.validate return true/false
  // in case of invalid inputs, it displays the error messages
  if (input.validate()) {
    // all input values are valid
    // can retrieve values from input.values
    console.log(input.values)
  }
}

```
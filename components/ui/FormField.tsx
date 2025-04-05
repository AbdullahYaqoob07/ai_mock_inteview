import React from 'react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField as ShadcnFormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Controller, FieldValues, Control, Path } from 'react-hook-form';

interface FormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'file';
}

const FormField = <T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = "text"
}: FormFieldProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <ShadcnFormField
          control={control}
          name={name}
          render={() => (
            <FormItem>
              <FormLabel className='label'>{label}</FormLabel>
              <FormControl>
                <Input className='input'
                  placeholder={placeholder} 
                  type={type}
                  {...field} 
                />
              </FormControl>
            
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    />
  );
};

export default FormField;
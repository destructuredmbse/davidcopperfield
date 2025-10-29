import * as React from 'react';
import { Field } from '@base-ui-components/react/field';

export default function PagesSelector({pages, setPages} : {pages?: string, setPages: React.Dispatch<React.SetStateAction<string>>}) {
  return (
    <Field.Root className="flex w-full max-w-16 flex-row items-start gap-1">
      <Field.Label className="text-xs text-gray-900">Pages</Field.Label>
      <Field.Control
        value={pages}
        placeholder="pages"
        className="h-3 w-12 pl-1 text-xs text-gray-600"
        onValueChange={(value:string) => setPages(value)}
      />

    </Field.Root>
  );
}

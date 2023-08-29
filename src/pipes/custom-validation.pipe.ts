import {
  BadRequestException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';

interface ErrorMessage {
  field: string;
  error: string;
}

function errorFormatter(errors: ValidationError[]): ErrorMessage[] {
  const message: ErrorMessage[] = [];

  for (const error of errors) {
    if (error.children.length > 0) {
      const children = error.children.map((item) => {
        return {
          ...item,
          property: `${error.property}.${item.property}`,
        };
      });

      errors.push(...children);
    } else {
      message.push({
        field: error.property,
        error: Object.values(error.constraints).join(', '),
      });
    }
  }

  return message;
}

export const CustomValidationPipe = new ValidationPipe({
  exceptionFactory: (validationErrors: ValidationError[] = []) => {
    return new BadRequestException(errorFormatter(validationErrors));
  },
});

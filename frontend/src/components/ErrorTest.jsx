import React, { useState } from 'react';
import { Button, Card, CardBody } from '@heroui/react';

const ErrorTest = () => {
  const [shouldThrow, setShouldThrow] = useState(false);

  if (shouldThrow) {
    throw new Error('This is a test error to demonstrate the Error Boundary!');
  }

  return (
    <Card className="m-4">
      <CardBody className="p-6 text-center">
        <h3 className="text-lg font-semibold mb-4">Error Boundary Test</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Click the button below to test the Error Boundary component
        </p>
        <Button
          color="danger"
          onClick={() => setShouldThrow(true)}
        >
          Throw Test Error
        </Button>
      </CardBody>
    </Card>
  );
};

export default ErrorTest;

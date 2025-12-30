import React from 'react';
import { motion } from 'framer-motion';
import { Button, Card, CardBody, CardHeader, Chip } from '@heroui/react';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);

    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    // Reload the page
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl w-full"
          >
            <Card className="shadow-2xl">
              <CardBody className="p-8 md:p-12">
                {/* Error Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="flex justify-center mb-8"
                >
                  <div className="relative">
                    <div className="w-32 h-32 bg-red-100 rounded-full flex items-center justify-center">
                      <Icon icon="mdi:alert-circle" className="w-20 h-20 text-red-600" />
                    </div>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 border-4 border-red-200 border-t-red-500 rounded-full"
                    />
                  </div>
                </motion.div>

                {/* Error Message */}
                <div className="text-center mb-8">
                  <Chip
                    color="danger"
                    variant="flat"
                    size="lg"
                    className="mb-4"
                    startContent={<Icon icon="mdi:bug" />}
                  >
                    Application Error
                  </Chip>

                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    Oops! Something Went Wrong
                  </h1>

                  <p className="text-lg text-gray-600 mb-2">
                    We encountered an unexpected error while processing your request.
                  </p>

                  <p className="text-gray-500">
                    Don't worry - our team has been notified and is working to fix the issue.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                  <Button
                    onPress={this.handleRetry}
                    color="primary"
                    size="lg"
                    variant="shadow"
                    startContent={<Icon icon="mdi:refresh" className="text-xl" />}
                  >
                    Refresh Page
                  </Button>
                  <Button
                    as={Link}
                    to="/"
                    variant="flat"
                    color="primary"
                    size="lg"
                    startContent={<Icon icon="mdi:home" className="text-xl" />}
                  >
                    Go to Homepage
                  </Button>
                  <Button
                    as={Link}
                    to="/contact"
                    variant="bordered"
                    color="primary"
                    size="lg"
                    startContent={<Icon icon="mdi:help-circle" className="text-xl" />}
                  >
                    Get Help
                  </Button>
                </div>

                {/* Quick Tips */}
                <Card className="bg-blue-50 border-2 border-blue-100">
                  <CardBody className="p-6">
                    <div className="flex items-start gap-3 mb-3">
                      <Icon icon="mdi:lightbulb" className="text-2xl text-blue-600 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-bold text-gray-900 mb-2">Try these quick fixes:</h3>
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li className="flex items-start gap-2">
                            <Icon icon="mdi:check" className="text-blue-600 flex-shrink-0 mt-0.5" />
                            <span>Refresh the page or clear your browser cache</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Icon icon="mdi:check" className="text-blue-600 flex-shrink-0 mt-0.5" />
                            <span>Check your internet connection</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Icon icon="mdi:check" className="text-blue-600 flex-shrink-0 mt-0.5" />
                            <span>Try accessing the page again in a few minutes</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* Error Details (Development Only) */}
                {import.meta.env.DEV && this.state.error && (
                  <details className="mt-8">
                    <summary className="cursor-pointer text-sm font-semibold text-gray-700 hover:text-gray-900 mb-4 flex items-center gap-2">
                      <Icon icon="mdi:code-tags" />
                      <span>Error Details (Development Mode)</span>
                      <Icon icon="mdi:chevron-down" className="ml-auto" />
                    </summary>
                    <Card className="bg-gray-900 border-2 border-gray-700">
                      <CardBody className="p-4">
                        <div className="text-xs font-mono text-gray-100 space-y-4">
                          <div>
                            <div className="text-red-400 font-bold mb-2 flex items-center gap-2">
                              <Icon icon="mdi:alert" />
                              Error Message:
                            </div>
                            <pre className="whitespace-pre-wrap bg-gray-800 p-3 rounded text-red-300 overflow-auto">
                              {this.state.error.toString()}
                            </pre>
                          </div>

                          {this.state.errorInfo && (
                            <div>
                              <div className="text-yellow-400 font-bold mb-2 flex items-center gap-2">
                                <Icon icon="mdi:file-tree" />
                                Component Stack:
                              </div>
                              <pre className="whitespace-pre-wrap bg-gray-800 p-3 rounded text-yellow-200 overflow-auto max-h-60">
                                {this.state.errorInfo.componentStack}
                              </pre>
                            </div>
                          )}

                          {this.state.error.stack && (
                            <div>
                              <div className="text-blue-400 font-bold mb-2 flex items-center gap-2">
                                <Icon icon="mdi:bug" />
                                Stack Trace:
                              </div>
                              <pre className="whitespace-pre-wrap bg-gray-800 p-3 rounded text-blue-200 overflow-auto max-h-60">
                                {this.state.error.stack}
                              </pre>
                            </div>
                          )}
                        </div>
                      </CardBody>
                    </Card>
                  </details>
                )}

                {/* Contact Support */}
                <div className="mt-8 pt-8 border-t border-gray-200 text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    Still experiencing issues? Our support team is here to help.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center items-center text-sm">
                    <a
                      href="mailto:service@aesservices.co.in"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <Icon icon="mdi:email" className="text-lg" />
                      service@aesservices.co.in
                    </a>
                    <span className="hidden sm:inline text-gray-300">|</span>
                    <span className="text-gray-600">
                      <Icon icon="mdi:shield-check" className="inline mr-1" />
                      24/7 Support Available
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Branding */}
            <div className="text-center mt-8 text-gray-500 text-sm">
              <p>
                <Icon icon="mdi:domain" className="inline mr-1" />
                HireLyft - Integrated Team Management Solutions
              </p>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

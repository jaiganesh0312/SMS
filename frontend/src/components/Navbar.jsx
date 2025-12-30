import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Navbar as NextUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Button,
  DropdownItem,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  Avatar,
  Image,
} from "@heroui/react";
import { useState } from 'react';
import { Icon } from "@iconify/react";
import NavigationDrawer from '@/components/NavigationDrawer';

export default function Navbar() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const school = user?.School;
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <NextUINavbar
        maxWidth="full"
        className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800"
        height="72px"
      >
        <NavbarContent>
          {/* Drawer Toggle Button - Only show when authenticated */}
          {isAuthenticated && (
            <NavbarItem>
              <Button
                isIconOnly
                variant="light"
                onPress={() => setIsDrawerOpen(true)}
                aria-label="Toggle navigation"
              >
                <Icon icon="mdi:menu" className="text-2xl" />
              </Button>
            </NavbarItem>
          )}

          {/* Logo */}
          <NavbarBrand>
            <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-3">
              {school?.logo ? (
                <div className="flex gap-2 items-center">
                  <Image src={`${import.meta.env.VITE_API_URL}/${school?.logo}`} alt="Logo" className="h-10 w-auto object-contain" />
                  <span className="text-xl font-bold text-gray-900 dark:text-white">{school?.name}</span>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Icon icon="mdi:check-circle-outline" className="text-2xl text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xl font-bold text-gray-900 dark:text-white md:inline hidden">School Management System</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white md:hidden inline">SMS</span>
                  </div>
                </>
              )}
            </Link>
          </NavbarBrand>
        </NavbarContent>

        <NavbarContent justify="end" className="gap-4">
          {isAuthenticated ? (
            <>
              {/* User Profile Dropdown */}
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
                    <div className="hidden sm:block text-right">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {user?.name}
                      </p>

                    </div>
                    <Avatar
                      as="button"
                      className="transition-transform"
                      color="primary"
                      name={user?.name}
                      size="sm"
                      src={'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user?.name}
                      fallback={<Icon icon="mdi:account" className="text-lg" />}
                      isBordered

                    />
                  </div>
                </DropdownTrigger>
                <DropdownMenu aria-label="Profile Actions" variant="flat">
                  <DropdownItem key="profile" className="h-14 gap-2" textValue="profile">
                    <p className="font-semibold text-gray-600 dark:text-gray-400">Signed in as</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{user?.email}</p>
                  </DropdownItem>
                  <DropdownItem
                    key="my_profile"
                    onPress={() => navigate('/profile')}
                    startContent={<Icon icon="mdi:account" className="text-lg" />}
                  >
                    My Profile
                  </DropdownItem>
                  <DropdownItem
                    key="settings"
                    onPress={() => navigate('/settings')}
                    startContent={<Icon icon="mdi:cog" className="text-lg" />}
                  >
                    Settings
                  </DropdownItem>

                  <DropdownItem
                    key="logout"
                    color="danger"
                    onPress={handleLogout}
                    startContent={<Icon icon="mdi:logout" className="text-lg" />}
                  >
                    Log Out
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </>
          ) : (
            <>
              <Link to="/enquiry">
                <Button
                  color="default"
                  variant="light"
                  size="md"
                  startContent={<Icon icon="mdi:email" />}
                >
                  Contact
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  color="primary"
                  variant="solid"
                  size="md"
                  startContent={<Icon icon="mdi:login" />}
                  className="bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  Login
                </Button>
              </Link>
            </>
          )}
        </NavbarContent>
      </NextUINavbar>

      {/* Navigation Drawer */}
      {isAuthenticated && (
        <NavigationDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
        />
      )}
    </>
  );
}

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
        className="bg-content1/80 dark:bg-content1/90 backdrop-blur-xl border-b border-default-200 dark:border-default-100 shadow-sm"
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
                className="text-default-600 hover:text-primary-500 hover:bg-primary-100 dark:hover:bg-primary-500/20"
              >
                <Icon icon="mdi:menu" className="text-2xl" />
              </Button>
            </NavbarItem>
          )}

          {/* Logo */}
          <NavbarBrand>
            <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-3 group">
              {school?.logo ? (
                <div className="flex gap-2 items-center">
                  <Image src={`${import.meta.env.VITE_API_URL}/${school?.logo}`} alt="Logo" className="h-10 w-auto object-contain" />
                  <span className="text-xl font-bold text-foreground group-hover:text-primary-500 transition-colors">{school?.name}</span>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
                    <Icon icon="mdi:school" className="text-2xl text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xl font-bold text-foreground group-hover:text-primary-500 transition-colors md:inline hidden">School Management System</span>
                    <span className="text-sm font-semibold text-foreground group-hover:text-primary-500 transition-colors md:hidden inline">SMS</span>
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
                      <p className="text-sm font-semibold text-foreground">
                        {user?.name}
                      </p>

                    </div>
                    <Avatar
                      as="button"
                      className="transition-transform ring-2 ring-primary-500/30 ring-offset-2 ring-offset-background"
                      color="primary"
                      name={user?.name}
                      size="sm"
                      src={'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user?.name}
                      fallback={<Icon icon="mdi:account" className="text-lg" />}
                      isBordered

                    />
                  </div>
                </DropdownTrigger>
                <DropdownMenu aria-label="Profile Actions" variant="flat" className="w-64">
                  <DropdownItem key="profile" className="h-16 gap-2" textValue="profile">
                    <p className="font-medium text-default-500 text-xs">Signed in as</p>
                    <p className="font-semibold text-foreground">{user?.email}</p>
                  </DropdownItem>
                  <DropdownItem
                    key="my_profile"
                    onPress={() => navigate('/profile')}
                    startContent={<Icon icon="mdi:account-circle" className="text-lg text-primary-500" />}
                    className="py-3"
                  >
                    My Profile
                  </DropdownItem>
                  <DropdownItem
                    key="settings"
                    onPress={() => navigate('/settings')}
                    startContent={<Icon icon="mdi:cog" className="text-lg text-default-500" />}
                    className="py-3"
                  >
                    Settings
                  </DropdownItem>

                  <DropdownItem
                    key="logout"
                    color="danger"
                    onPress={handleLogout}
                    startContent={<Icon icon="mdi:logout" className="text-lg" />}
                    className="py-3"
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
                  startContent={<Icon icon="mdi:email-outline" />}
                  className="text-default-600 hover:text-primary-500"
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
                  className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-md hover:shadow-lg hover:shadow-primary-500/30 transition-all duration-300"
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

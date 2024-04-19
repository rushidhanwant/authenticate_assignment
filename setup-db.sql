create user "authenticateAdmin" with password 'authenticateAdmin1234';
drop database IF EXISTS authenticate;
drop database IF EXISTS authenticate_test;
create database authenticate owner "authenticateAdmin";
create database authenticate_test owner "authenticateAdmin";

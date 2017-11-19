import angular from 'angular';
import 'angular-mocks';

import { login } from './login.module';
import { auth } from '../auth.module';

const { inject } = angular.mock;

describe('Auth', () => {
  beforeEach(() => {
    angular.mock.module(login);
    angular.mock.module(auth);
    angular.mock.module(($stateProvider) => {
      $stateProvider.state('app', { url: '/' });
    });
  });

  describe('Routes', () => {
    let $state;
    let $location;
    let $rootScope;

    function goTo(url) {
      $location.url(url);
      $rootScope.$digest();
    }

    beforeEach(inject(($injector) => {
      $state = $injector.get('$state');
      $location = $injector.get('$location');
      $rootScope = $injector.get('$rootScope');
    }));

    it('should redirect to auth.login state', () => {
      goTo('/auth');
      expect($state.current.name).toEqual('auth.login');
    });

    it('should go to auth.login state', () => {
      goTo('/login');
      expect($state.current.name).toEqual('auth.login');
    });
  });

  describe('LoginController', () => {
    let $componentController;
    let controller;
    let AuthService;
    let $state;
    let $rootScope;
    let $q;

    beforeEach(inject(($injector) => {
      $componentController = $injector.get('$componentController');
      AuthService = $injector.get('AuthService');
      $state = $injector.get('$state');
      $rootScope = $injector.get('$rootScope');
      $q = $injector.get('$q');

      controller = $componentController('login', {
        $scope: {},
        AuthService,
        $state,
      });
    }));

    it('should initialize with correct properties', () => {
      controller.$onInit();

      expect(controller.error).toBeNull();
      expect(controller.user.email).toEqual('');
      expect(controller.user.password).toEqual('');
    });

    it('should redirect on successful login ', () => {
      const mockUser = { email: 'test@test.com', password: 'insecure' };
      const mockEvent = { $event: { user: mockUser } };

      spyOn(AuthService, 'login').and.callFake(() => $q.when({ $id: 1 }));
      spyOn($state, 'go');

      const promise = controller.loginUser(mockEvent);

      promise.then(() => {
        expect(AuthService.login).toHaveBeenCalledWith(mockEvent.user);
        expect($state.go).toHaveBeenCalledWith('app');
      });

      $rootScope.$digest();
    });

    it('should set error on failed login ', () => {
      const mockUser = { email: 'test@test.com', password: 'insecure' };
      const mockEvent = { $event: { user: mockUser } };
      const mockMessage = 'wrong username or password';

      spyOn(AuthService, 'login').and.callFake(() => $q.reject({ message: mockMessage }));
      spyOn($state, 'go');

      const promise = controller.loginUser({});

      promise.then(() => {
        expect(AuthService.login).toHaveBeenCalledWith(mockEvent.user);
        expect(controller.error).toEqual(mockMessage);
        expect($state.go).not.toHaveBeenCalled();
      });

      $rootScope.$digest();
    });
  });
});

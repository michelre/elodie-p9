/**
 * @jest-environment jsdom
 */

import { screen, fireEvent, createEvent } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import store from '../__mocks__/store.js'
import {localStorageMock} from "../__mocks__/localStorage.js";
import userEvent from "@testing-library/user-event";
import { ROUTES } from "../constants/routes.js";


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("When I call handleChangeFile, it should call the create store function", () => {
      //Prepare
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "employee@test.tld"
      }))
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      const html = NewBillUI()
      document.body.innerHTML = html

      const newbill = new NewBill({
        document, onNavigate, store, localStorage: window.localStorage
      })
      const event = {
        preventDefault: () => {},
        target: {
          value: ''
        }
      }
      const create = jest.fn().mockImplementation(() => {
        return Promise.resolve({fileUrl: '', key: ''})
      })
      store.bills = jest.fn().mockImplementation(() => {
        return {
          create
        }
      })
      const file = new File(['hello'], 'hello.png', {type: 'image/png'})
      const input = screen.getByTestId('file')
      userEvent.upload(input, file)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('email', 'employee@test.tld')
      // Exectute
      newbill.handleChangeFile(event)

      // Assertion
      expect(create).toHaveBeenCalled()
    })
  })
  test("When I upload a wrong file, it should display an error", () => {
    //Prepare
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee',
      email: "employee@test.tld"
    }))
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname })
    }

    const html = NewBillUI()
    document.body.innerHTML = html

    const newbill = new NewBill({
      document, onNavigate, store, localStorage: window.localStorage
    })
    const event = {
      preventDefault: () => {},
      target: {
        value: ''
      }
    }
    const create = jest.fn().mockImplementation(() => {
      return Promise.resolve({fileUrl: '', key: ''})
    })
    const file = new File(['hello'], 'hello.pdf', {type: 'application/pdf'})
    const input = screen.getByTestId('file')
    userEvent.upload(input, file)
  
    // Exectute
    newbill.handleChangeFile(event)

    // Assertion
    const errorElement = screen.queryByText('Veuillez sélectionner le bon format de fichier')
    expect(errorElement).toBeDefined()
  })
  test("When I call handleSubmit, updateBill function should be called", () => {
    //Prepare
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee',
      email: "employee@test.tld"
    }))    
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname })
    }

    const html = NewBillUI()
    document.body.innerHTML = html

    const newbill = new NewBill({
      document, onNavigate, store, localStorage: window.localStorage
    })


    const event = {
      preventDefault: () => {},
      target:  {
        querySelector: () => {
          return {value: ''}
        }
      }
    }

    const updateBillMock = jest.spyOn(newbill, 'updateBill').mockImplementation(() => {})    

    // Exectute
    newbill.handleSubmit(event)

    // Assertion    
    expect(updateBillMock).toHaveBeenCalled()
  })
})

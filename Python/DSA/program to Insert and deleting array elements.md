## program to insert and delete an element in an array in python
## inserting an element in the last postion of the array
## list=[10,16,13,27]
## list.append(100)
## print(list)

## OUTPUT:
## [10, 16, 13, 27, 100]

## deleting the element from the last postion
## list=[10,16,13,27,100]
## list.pop()
## print(list)

## OUTPUT:
## [10, 16, 13, 27]

## inserting an element to the specified psotion of the array and
## inserting an element to the first position of the array
## list=[18,64,98,11]
## list.insert(0,10)
## print(list)

## OUTPUT:
## [10, 18, 64, 98, 11]

## deleting an specified element from the list
## list=[15,100,255,13,6]
## list.remove(13)
## print(list)

## deleting the last element from list
## list=[120,65,89,56,99]
## list.pop()
## print(list)

## deleting an specified element from the list using index(need to use index values)
## list=[120,65,89,56,99]
## list.pop(2)
## print(list)

## OUTPUT:
## [120, 65, 56, 99] ##the second postion element is deleted

## verifying the element present in the index value(returns the index value)
## list=[10,11,15,29,45]
## x=list.index(15)
## print(x)

## OUTPUT:
2 ## returns the index value of the specified element

## extending the list of elements by adding the elements from one list to another
b=[1,9,99,300]
list=[10,11,15,29,45]
list.extend(b)
print(list)

## OUTPUT:
## [10,11,15,29,45,1,9,99,300]


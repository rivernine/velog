# Python

## 리스트 
```py
# 원소 추가
>>> a = [1, 2, 3, 4, 5]
>>> a.append(6)
>>> a
[1, 2, 3, 4, 5, 6]

# 원소 삽입
>>> a = [1, 2, 3]
>>> a.insert(1, 5)
>>> a
[1, 5, 2, 3]

# 원소 삭제
>>> a = [1, 2, 3, 4, 5, 6, 7]
>>> del a[1]
>>> a
[1, 3, 4, 5, 6, 7]

## 초기화
# 일반적인 초기화
>>> lst = [1, 2, 3, 4]  
>>> lst
[1, 2, 3, 4]

# for문 사용
>>> lst = [ _ for _ in range(0, 5) ]
>>> lst
[0, 1, 2, 3, 4]

>>> lst = [ 0 for _ in range(0, 5) ]
>>> lst
[0, 0, 0, 0, 0]

>>> lst = [[0 for _ in range(0, 5)] for _ in range(0, 5)]
>>> lst
[[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]]
```

## Copy
참조가 아닌 새로운 객체를 생성하는 copy **(deep copy)**
```py
>>> import copy
>>> a = [[1,2],[3,4]]
>>> b = copy.deepcopy(a)
>>> a[1].append(5)
>>> a
[[1, 2], [3, 4, 5]]
>>> b
[[1, 2], [3, 4]]
```

## map
반복 가능한 `iterable`객체를 받아서 각 요소에 함수를 적용해주는 함수이다.
```py
map(적용시킬 함수, 적용할 요소)
```

## Unpacking
```py
def sum(a, b, c):
    return a + b + c

numbers = [1, 2, 3]
sum(numbers) # error

print(sum(*numbers)) # 출력 : 6
```

## Transpose
행, 열 바꾸기
```py
>>> lst = [[1,2,3],[4,5,6],[7,8,9]]
>> [list(x) for x in zip(*lst)]
[[1, 4, 7], [2, 5, 8], [3, 6, 9]]
```
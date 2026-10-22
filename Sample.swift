import Foundation
// print("Hellow")
// let greeting = "Hello"
// var name = "Swift"
// print(greeting + ", " + name)

// let pi: Double = 3.14159
// var count: Int = 3
// print("pi = \(pi), count = \(count)")

// // func name(parameters) -> Type {
    
// // }

// func add(_ a:Int,_ b:Int) -> Int
// {
//     return a + b
// }

// let temp=10
// var updated_value=temp+10
// updated_value+=10

// print("Sum function ",  add(2,5) + 10, "Updated Value = ", updated_value)


// let newName = "Kai"
// print("Hello, \(newName)!")

// let c = 2, d = 3
// print("Total: \(c + d)")

// let from = 10; let to = 25
// let s = 25
// for n in from...to {
//   print(n, terminator: " ") // prints on one line
// }
// for n in 20...50 {
//   print(n, terminator: "*") // prints on one line
// }


// let x = -7
// print(abs(x))          // 7
// print(min(3, 8))       // 3
// print(max(3, 8)) 

// let a=10; let b=20
// print("a=\(a), b=\(b)")  

// // let p=10,let q=20
// // let switch = "ok"   //gives error as switch cannot use as identifier
// let _4wsse = "ok"
// let _hidden=true

// let `switch` = "black" //backtick to use reserved keywords

// print(_4wsse)


// var j:String? = nil
// // j = "hey bro"

// print(j ?? "not found")

// var nickname: String? = nil
// nickname = "KJ"
// print(nickname ?? "none")


// func tempFunction() -> Int {
//  let first = "Hello"
// let second = "Swift"
// // Concatenation
// print(first + ", " + second)
// // Interpolation
// print("\(first), \(second)")

// let a = 2, b = 3
// print("a = \(a), b = \(b), sum = \(a + b)")   
// return 2
// }
// // tempFunction()

// let functionOutput = tempFunction()

// print("Function output ", functionOutput)


// func seperateCommanFunc()
// {
//     let a = 1, b = 2, c = 3
// print(a, b, c, separator: ", ", terminator: "; ")
// print("done", terminator: "; ")  // prints on the same line after a semicolon
// print( "new done")
// }

// seperateCommanFunc()

// var x = 1, y = 2, z = 3
// let a = 10, b = 20
// print(x, y, z, a, b)

// var i: Int = 1, j: Int = 2
// let firstName: String = "Robin", lastName: String = "Refsnes"
// print(i + j, firstName, lastName)

// let name = "Swift"
// let π = 3.14
// let _hidden = true

// let `switch` = "ok"   // escape a keyword using backticks
// let 🐶 = "dog"          // Unicode identifier
// print(`switch`, 🐶)


// var nums = [1, 2]
// nums.append(3)       // OK: nums is var
// print(nums)

// let fixed = [1, 2]
// // fixed.append(3)  // Error if uncommented: cannot use mutating member on immutable value


// let anInt = 42           // Int
// let aDouble = 3.14       // Double
// let isSwiftFun = true    // Bool
// let greeting = "Hello"    // String
// print(aDouble)
// print(isSwiftFun)
// print(greeting)

// let inferred = 10          // Int (inferred)
// let annotated: Double = 3  // Double (explicit)
// print(type(of: inferred), type(of: annotated))

// let a = 5, b = 2
// print(a - b)
// print(a * b)
// print(Double(a) / Double(b))

// print(a%b)


// let a = true, b = false
// print(a && b)
// print(a || b)
// print(!a)


// let a = 5, b = 3
// print(a > b)   // true
// print(a == b)  // false
// print(a != b)  // true


// let ch: Character = "A"
// print(ch)
// let word = "Swift"
// print(word.count)

// let ch: Character = "A"
// let s = String(ch)
// print(s)              // "A

// print(type(of:s),type(of:ch))

// let heart: Character = "❤️"
// print(heart)
// let flag: Character = "🇳🇴" // composed of two regional indicators
// print(flag)
// print("e\u{301}".count) // 1 (e + combining acute accent)

// for scalar in flag.unicodeScalars {
//     print(String(format: "%@ -> U+%04X", String(scalar), scalar.value))
// }


// let items: [Any] = [1, "Swift"]
// for item in items {
//   if let i = item as? Int {
//     print("Int: \(i)")
//   } else if let s = item as? String {
//     print("String: \(s)")
//   }
// }

// let value: Any = 42
// let i = value as! Int   // forced downcast
// print(i)


// let speed = 42 as Double

// // Bridging a Swift String or Array to its Objective-C Foundation counterpart
// // import Foundation
// let nsString = "Hello" as NSString

// print(type(of:speed))




// let a = 5, b = 2
// // Arithmetic
// print(a + b)
// // Comparison
// print(a > b)
// // Logical
// let t = true, f = false
// print(t && !f)


let flag = false
print(!flag)              // unary NOT
let score = 85
let label = score >= 90 ? "A" : "Not A"
print(label)

var total = 10
total += 5
print(total)
total -= 3
print(total)
total *= 2
print(total)
total /= 4
print(total)


// var s = "Hello"
// s += ", Swift"
// print(s)


// let s1 = "Hello"
// let s2 = "Swift"
// print(s1 + " " + s2)
// print("\(s1), \(s2)!")
// let word = "Swift"
// print(word.count)
// print(s1.isEmpty)


// let text = "Swift"
// let start = text.startIndex
// let end = text.index(start, offsetBy: 3)
// let sub = text[start..<end]  // "Swi"
// print(sub)
// print(text.uppercased())


let age = 5
print("Age: \(age)")
let text = "You are " + String(age)
print(text)
let pi = 3.14
print("pi = \(Int(pi))")


let s1 = "123"
let n1 = Int(s1)           // Int?
print(n1 ?? 0)

let s2 = "abc"
let n2 = Int(s2)           // n2=nil (not a number)
print(n2 == nil)



print("Hello\nSwift")
print("A\tB\tC")
print("\"quoted\"")
print("\"<{}>\"")
print("\\")


let poem = """
Roses are red,
Violets are blue.
"""
print(poem)


let e1 = "é"
let e2 = "e\u{301}"   // e + COMBINING ACUTE ACCENT
print(e1 == e2)
print(e2)


let s = "e\u{301}"
for scalar in s.unicodeScalars {
  print(scalar.value)   // 101, 769
}


var numbers = [10, 20, 30]
print(numbers[0])         // 10
numbers.append(40)
print(numbers.count)      // 4
print(numbers.isEmpty)    // false


var items = ["A", "B", "C"]
items.insert("X", at: 1)
print(items)
items.remove(at: 2)
print(items)


// let fruits = ["Apple", "Banana", "Cherry"]
// for fruit in fruits {
//   print(fruit)
// }
// for (i, fruit) in fruits.enumerated() {
//   print("\(i): \(fruit)")
// }

// let fruits = ["Apple", "Banana", "Cherry"]
// fruits.forEach { print($0) }
// fruits.enumerated().forEach { print("\($0.offset): \($0.element)") }


// let nums = [10, 20, 30, 40, 50]
// let middle = nums[1...3]          // ArraySlice<Int>
// print(middle)                     // [20, 30, 40]
// let copy = Array(middle)          // Array<Int>
// print(copy)

// for item in nums[1...3]
// {
//     print("Printing ",item)
// }

// for item in nums[1..<3]
// {
//     print("Printing before index 3 ",item)
// }


var fruits = ["Apple", "Banana", "Cherry", "Mango"]
var slice = fruits[1..<3]
// var slice = Array(fruits[1..<3]) // Convert to Array for zero-based indices. 
slice[1] = "Orange"   // slices keep the original indices
print(slice)          // ["Orange", "Cherry"]  if Coverted to Arrary then Answer would be ["Banana", "Oranage"]
print(fruits)         // ["Apple", "Banana", "Cherry", "Mango"]

let arr = [0, 1, 2, 3, 4]
print(arr[...2])  // first three elements (0...2)
print(arr[..<2])  // first two elements (0..<2)
print(arr[2...])  // from index 2 to the end

print(arr[1...3])
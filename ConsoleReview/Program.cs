using System;

class Program
{
    static void Main()
    {
        Console.Write("start: ");
        int start = int.Parse(Console.ReadLine() ?? "0");

        Console.Write("end: ");
        int end = int.Parse(Console.ReadLine() ?? "0");

        if (start > end)
        {
            int temp = start;
            start = end;
            end = temp;
        }

        for (int i = start; i <= end; i++)
        {
            if (i % 3 == 0 && i % 5 == 0)
            {
                Console.WriteLine("FizzBuzz");
            }
            else if (i % 3 == 0)
            {
                Console.WriteLine("Fizz");
            }
            else if (i % 5 == 0)
            {
                Console.WriteLine("Buzz");
            }
            else
            {
                Console.WriteLine(i);
            }
        }
    }
}

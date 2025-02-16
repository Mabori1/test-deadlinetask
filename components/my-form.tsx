"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ThemeSwitcher from "./theme-switcher";

const FormSchema = z.object({
  token: z.string().uuid({ message: "Invalid token" }),
  title: z
    .string()
    .min(10, {
      message: "Description must be at least 10 characters.",
    })
    .max(80, {
      message: "Description must not be longer than 80 characters.",
    }),

  description: z
    .string()
    .min(10, {
      message: "Description must be at least 10 characters.",
    })
    .max(160, {
      message: "Description must not be longer than 160 characters.",
    }),

  tags: z
    .string()
    .min(2, {
      message: "Tags must be at least 2 characters.",
    })
    .max(60, {
      message: "Tags must not be longer than 60 characters.",
    }),
  budget: z.array(z.number()).default([1000, 5000]),
  deadline: z.number().positive(),
  reminds: z.number().positive(),
});

export default function MyForm() {
  const [isMounted, setIsMounted] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      token: "",
      title: "",
      description: "",
      tags: "",
      budget: [1000, 5000],
      deadline: 1,
      reminds: 1,
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const rules = {
      budget_from: 5000,
      budget_to: 8000,
      deadline_days: 5,
      qty_freelancers: 1,
    };

    const queryParams = new URLSearchParams({
      token: data.token,
      title: data.title,
      description: data.description,
      tags: data.tags
        .split(",")
        .map((tag) => tag.trim())
        .join(","),
      budget_from: data.budget[0].toString(),
      budget_to: data.budget[1].toString(),
      deadline: data.deadline.toString(),
      reminds: data.reminds.toString(),
      all_auto_responses: "false",
      rules: JSON.stringify(rules, null, 2),
    });

    const apiUrl = `https://deadlinetaskbot.productlove.ru/api/v1/tasks/client/newhardtask?${queryParams}`;

    try {
      const response = await fetch(apiUrl);
      form.reset();

      if (response.ok) {
        toast.success("Запрос успешно отправлен", {
          description: JSON.stringify(data, null, 2),
        });

        if (data.token) {
          localStorage.setItem("task_token", data.token);
        }
        window.open(apiUrl, "_blank");
      } else {
        toast.error("Запрос не отправлен");
      }
    } catch (error) {
      toast.error(`Запрос не отправлен, ошибка: ${error}`);
    }
  }

  useEffect(() => {
    setIsMounted(true);
    const savedToken = localStorage.getItem("task_token");
    if (savedToken) {
      form.setValue("token", savedToken);
    }
  }, [form]);

  if (!isMounted) return <></>;

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Create task</CardTitle>
          <ThemeSwitcher />
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-6"
          >
            <FormField
              control={form.control}
              name="token"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Token</FormLabel>
                  <FormControl>
                    <Input placeholder="Введите токен..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Создать ..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Описание задачи..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input placeholder="Тэги задачи через запятую" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="budget"
              render={({ field: { value, onChange } }) => (
                <FormItem>
                  <FormLabel>
                    {value
                      ? `Budget: ${value[0]}-${value[1]}`
                      : "Budget: 1000-5000"}
                  </FormLabel>
                  <FormControl>
                    <Slider
                      step={100}
                      max={8000}
                      defaultValue={[1000, 5000]}
                      onValueChange={(vals) => {
                        onChange(vals);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex w-full items-center gap-12 justify-between">
              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deadline (day)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reminds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reminds</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

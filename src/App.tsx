import { useState } from "react";
import "./styles/global.css";

import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "./lib/supabase";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5mb
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const createUserFormSchema = z.object({
  avatar: z
    .instanceof(FileList)
    .refine((files) => !!files.item(0), "A imagem de perfil é obrigatória")
    .refine(
      (files) => files.item(0)!.size <= MAX_FILE_SIZE,
      `Tamanho máximo de 5MB`
    )
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files.item(0)!.type),
      "Formato de imagem inválido"
    )
    .transform((files) => {
      return files.item(0)!;
    }),
  name: z
    .string()
    .nonempty("O nome é obrigatório")
    .transform((name) => {
      return name
        .trim()
        .split(" ")
        .map((word) => {
          return word[0].toLocaleUpperCase().concat(word.substring(1));
        })
        .join(" ");
    }),
  email: z
    .string()
    .nonempty("O email é obrigatório")
    .email("Formato de email inválido")
    .toLowerCase()
    // .refine((email) => {
    //   return email.endsWith("@rocketseat.com.br");
    // }, "O email precisa ser da rocketseat")
    // .refine((email) => {
    //   return email.endsWith("@gmail.com");
    // }, "O email precisa ser do google")
    .refine((email) => {
      return email.endsWith("@hotmail.com");
    }, "O email precisa ser do hotmail"),

  password: z.string().min(6, "A senha precisa de no mínimo 6 caracteres"),
  techs: z
    .array(
      z.object({
        title: z.string().nonempty("O título é obrigatório"),
        knowledge: z.coerce.number().min(1).max(100),
      })
    )
    .min(2, "Insira pelo menos 2 tecnologias")
    .refine((techs) => {
      return techs.some((tech) => tech.knowledge > 50);
    }, "Você está aprendendo"),
});

type CreateUserFormData = z.infer<typeof createUserFormSchema>;

export function App() {
  const [output, setOutput] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserFormSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "techs",
  });

  function addNewTech() {
    append({
      title: "",
      knowledge: 0,
    });
  }

  async function createUser(data: CreateUserFormData) {
    console.log(data.avatar);
    await supabase.storage
      .from("form-react")
      .upload(data.avatar.name, data.avatar);
    setOutput(JSON.stringify(data, null, 2));
  }

  return (
    <main className="h-screen bg-zinc-950 text-zinc-300 flex flex-col gap-10 items-center justify-center">
      <form
        onSubmit={handleSubmit(createUser)}
        className="flex flex-col gap-4 w-full max-w-xs"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="avatar" className="text-sm text-zinc-600">
            Avatar
          </label>
          <input type="file" accept="image/*" {...register("avatar")} />
          {errors.avatar && <span>{errors.avatar.message}</span>}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="name" className="text-sm text-zinc-600">
            Nome
          </label>
          <input
            type="text"
            className="rounded border border-zinc-600 shadow-sm px-3 py-1 bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
            {...register("name")}
          />
          {errors.name && <span>{errors.name.message}</span>}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm text-zinc-600">
            Email
          </label>
          <input
            type="email"
            className="rounded border border-zinc-600 shadow-sm px-3 py-1 bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
            {...register("email")}
          />
          {errors.email && <span>{errors.email.message}</span>}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm text-zinc-600">
            Senha
          </label>
          <input
            type="password"
            className="rounded border border-zinc-600 shadow-sm px-3 py-1 bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
            {...register("password")}
          />
          {errors.password && <span>{errors.password.message}</span>}
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor=""
            className="flex items-center justify-between text-sm text-zinc-600"
          >
            Tecnologias
            <button
              type="button"
              onClick={addNewTech}
              className="text-emerald-500 text-sm"
            >
              Adicionar
            </button>
          </label>

          {fields.map((field, index) => {
            return (
              <div key={field.id} className="flex gap-2">
                <div className="flex-1 flex flex-col gap-1">
                  <input
                    type="text"
                    className="border border-zinc-800 shadow-sm rounded h-10 px-3 bg-zinc-900 text-white"
                    {...register(`techs.${index}.title`)}
                  />

                  {errors.techs?.[index]?.title && (
                    <span>{errors.techs?.[index]?.title?.message}</span>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <input
                    type="number"
                    className="w-16 border border-zinc-800 shadow-sm rounded h-10 px-3 bg-zinc-900 text-white"
                    {...register(`techs.${index}.knowledge`)}
                  />

                  {errors.techs?.[index]?.knowledge && (
                    <span>{errors.techs?.[index]?.knowledge?.message}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {errors.techs && (
          <span className="text-red-500 text-sm">{errors.techs.message}</span>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-emerald-500 rounded font-semibold text-white h-10 hover:bg-emerald-600"
        >
          Salvar
        </button>
      </form>

      <pre>{output}</pre>
    </main>
  );
}

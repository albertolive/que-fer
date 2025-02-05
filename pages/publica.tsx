import { useState, useMemo, ChangeEvent } from "react";
import { useRouter } from "next/router";
import { captureException } from "@sentry/nextjs";
import {
  slug,
  getFormattedDate,
  getRegionLabelByValue,
  getTownLabel,
} from "@utils/helpers";
import {
  DatePicker,
  Input,
  Select,
  TextArea,
  ImageUpload,
} from "@components/ui/common/form";
import Meta from "@components/partials/seo-meta";
import {
  env,
  generateRegionsOptions,
  generateTownsOptions,
} from "@utils/helpers";
import { siteUrl } from "@config/index";
import type { NextPage } from "next";

interface FormData {
  title: string;
  description: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  region: SelectOption | null;
  town: SelectOption | null;
  location: string;
  imageUploaded: File | null;
  eventUrl: string;
}

interface SelectOption {
  value: string;
  label: string;
}

interface FormState {
  isDisabled: boolean;
  isPristine: boolean;
  message: string;
}

const defaultForm: FormData = {
  title: "",
  description: "",
  startDate: undefined,
  endDate: undefined,
  region: null,
  town: null,
  location: "",
  imageUploaded: null,
  eventUrl: "",
};

const _createFormState = (
  isDisabled = true,
  isPristine = true,
  message = ""
): FormState => ({
  isDisabled,
  isPristine,
  message,
});

const createFormState = (form: FormData, isPristine: boolean): FormState => {
  if (!isPristine) {
    return _createFormState(true, true, "");
  }

  if (!form.title || form.title.length < 10) {
    return _createFormState(true, true, "Títol obligatori, mínim 10 caràcters");
  }

  if (
    !form.description.replace(/(<([^>]+)>)/gi, "") ||
    form.description.length < 15
  ) {
    return _createFormState(
      true,
      true,
      "Descripció obligatòria, mínim 15 caràcters"
    );
  }

  if (!form.imageUploaded) {
    return _createFormState(true, true, "Imatge obligatoria");
  }

  if (!form.region) {
    return _createFormState(true, true, "Comarca obligatoria");
  }

  if (!form.town) {
    return _createFormState(true, true, "Ciutat obligatoria");
  }

  if (!form.location) {
    return _createFormState(true, true, "Lloc obligatori");
  }

  if (!form.startDate) {
    return _createFormState(true, true, "Data inici obligatòria");
  }

  if (!form.endDate) {
    return _createFormState(true, true, "Data final obligatòria");
  }

  if (form.endDate.getTime() <= form.startDate.getTime()) {
    return _createFormState(
      true,
      true,
      "Data final no pot ser anterior o igual a la data inici"
    );
  }

  const urlPattern = new RegExp(
    "^(https?:\\/\\/)?" +
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|" +
      "((\\d{1,3}\\.){3}\\d{1,3}))" +
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" +
      "(\\?[;&a-z\\d%_.~+=-]*)?" +
      "(\\#[-a-z\\d_]*)?$",
    "i"
  );

  if (form.eventUrl && !urlPattern.test(form.eventUrl)) {
    return _createFormState(true, true, "Enllaç no vàlid");
  }

  return _createFormState(false);
};

const Publica: NextPage = () => {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(defaultForm);
  const [region, setRegion] = useState<string>("");
  const [formState, setFormState] = useState<FormState>(_createFormState());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [imageToUpload, setImageToUpload] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

  const regionsArray = useMemo(() => generateRegionsOptions(), []);
  const citiesArray = useMemo(() => generateTownsOptions(region), [region]);

  const handleFormChange = (name: keyof FormData, value: any) => {
    const newForm = { ...form, [name]: value };
    setForm(newForm);
    setFormState(createFormState(newForm, true));
  };

  const handleChange = (e: ChangeEvent<{ name: string; value: string }>) =>
    handleFormChange(e.target.name as keyof FormData, e.target.value);

  const handleChangeDate = (
    name: keyof Pick<FormData, "startDate" | "endDate">,
    value: Date | null
  ) => handleFormChange(name, value as any);

  const handleRegionChange = (region: SelectOption | null) => {
    setRegion(region?.value || "");
    handleFormChange("region", region);
  };

  const handleImageChange = (file: File) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setImageToUpload(reader.result as string);
    });
    reader.readAsDataURL(file);
    handleFormChange("imageUploaded", file);
  };

  const handleTownChange = (town: SelectOption | null) =>
    handleFormChange("town", town);

  const goToEventPage = (url: string) => ({
    pathname: url,
    query: { newEvent: true },
  });

  const onSubmit = async () => {
    const newFormState = createFormState(form, formState.isPristine);
    setFormState(newFormState);

    if (!newFormState.isDisabled) {
      setIsLoading(true);

      try {
        const townValue = form.town?.value ?? "";
        const regionValue = form.region?.value ?? "";
        const location = `${form.location}, ${getTownLabel(
          townValue
        )}, ${getRegionLabelByValue(regionValue)}`;

        const rawResponse = await fetch("/api/postEvent", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...form,
            location,
            imageUploaded: !!imageToUpload,
          }),
        });

        if (rawResponse.ok) {
          const { id } = await rawResponse.json();
          const { formattedStart } = getFormattedDate(
            form.startDate ? form.startDate.toISOString() : "",
            form.endDate ? form.endDate.toISOString() : ""
          );
          const slugifiedTitle = slug(form.title, formattedStart, id);

          if (env === "prod") {
            fetch(process.env.NEXT_PUBLIC_NEW_EVENT_EMAIL_URL as string, {
              method: "POST",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ title: form.title, slug: slugifiedTitle }),
            }).catch((error) => {
              console.error(`Error sending new event email: ${error.message}`);
              captureException(
                new Error(`Error sending new event email: ${error.message}`)
              );
            });
          }

          imageToUpload
            ? await uploadFile(id, slugifiedTitle)
            : router.push(goToEventPage(`/e/${slugifiedTitle}`));
        } else {
          const errorText = await rawResponse.text();
          const errorMessage = `Error submitting form: ${errorText}`;
          console.error(errorMessage);
          captureException(new Error(errorMessage));
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        setIsLoading(false);
        setFormState(
          _createFormState(
            true,
            true,
            "Hi ha hagut un error, torna-ho a provar més tard o contacta amb nosaltres."
          )
        );
        if (error instanceof Error) {
          captureException(
            new Error(`Error submitting form: ${error.message}`)
          );
        }
      }
    }
  };

  const uploadFile = async (id: string, slugifiedTitle: string) => {
    try {
      const url = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUDNAME}/upload`;
      const xhr = new XMLHttpRequest();
      const fd = new FormData();
      xhr.open("POST", url, true);
      xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");

      xhr.upload.addEventListener("progress", (e) => {
        setProgress(Math.round((e.loaded * 100.0) / e.total));
      });

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            console.log(response.public_id);
            router.push(goToEventPage(`/e/${slugifiedTitle}`));
          } else {
            const error = JSON.parse(xhr.responseText).error;
            console.error("Error uploading file:", error);
            setIsLoading(false);
            setFormState(
              _createFormState(
                true,
                true,
                `Hi ha hagut un error en pujar la imatge: ${error.message}, torna-ho a provar més tard o contacta amb nosaltres.`
              )
            );
            captureException(
              new Error(`Error uploading file: ${error.message}`)
            );
          }
        }
      };

      fd.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_UNSIGNED_UPLOAD_PRESET as string
      );
      fd.append("tags", "browser_upload");
      fd.append("file", imageToUpload as string);
      fd.append("public_id", id);
      xhr.send(fd);
    } catch (error) {
      console.error("Error uploading file:", error);
      setIsLoading(false);
      setFormState(
        _createFormState(
          true,
          true,
          "Hi ha hagut un error en pujar la imatge, torna-ho a provar més tard o contacta amb nosaltres."
        )
      );
      if (error instanceof Error) {
        captureException(new Error(`Error uploading file: ${error.message}`));
      }
      throw error;
    }
  };

  return (
    <>
      <Meta
        title="Publica - Esdeveniments.cat"
        description="Publica un acte cultural - Esdeveniments.cat"
        canonical={`${siteUrl}/publica`}
      />
      <div className="w-full flex flex-col justify-center items-center pt-2 pb-14 sm:w-[580px] md:w-[768px] lg:w-[1024px] px-4 md:px-0">
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-center italic uppercase font-semibold">
              Publica un esdeveniment
            </h1>
            <p className="text-sm text-center">* camps obligatoris</p>
          </div>
          <div className="w-full flex flex-col justify-center items-center gap-y-4 pt-4 sm:w-[580px] md:w-[768px] lg:w-[1024px]">
            <Input
              id="title"
              title="Títol *"
              value={form.title}
              onChange={handleChange}
            />

            <TextArea
              id="description"
              value={form.description}
              onChange={handleChange}
            />

            <Input
              id="eventUrl"
              title="Enllaç de l'esdeveniment"
              value={form.eventUrl}
              onChange={handleChange}
            />

            <ImageUpload
              value={imageToUpload}
              onUpload={handleImageChange}
              progress={progress}
            />

            <Select
              id="region"
              title="Comarca *"
              options={regionsArray}
              value={form.region}
              onChange={handleRegionChange}
              isClearable
              placeholder="una comarca"
            />

            <Select
              id="town"
              title="Ciutat *"
              options={citiesArray}
              value={form.town}
              onChange={handleTownChange}
              isDisabled={!form.region}
              isClearable
              placeholder="un poble"
            />

            <Input
              id="location"
              title="Lloc *"
              value={form.location}
              onChange={handleChange}
            />

            <DatePicker
              startDate={form.startDate}
              endDate={form.endDate}
              onChange={handleChangeDate}
            />
          </div>
        </div>
        {formState.isPristine && formState.message && (
          <div className="p-4 my-3 text-primary rounded-lg text-md">
            {formState.message}
          </div>
        )}

        <div className="flex justify-center pt-10">
          <button
            disabled={isLoading}
            onClick={onSubmit}
            className={`text-blackCorp bg-whiteCorp hover:bg-primary hover:border-whiteCorp hover:text-whiteCorp border-blackCorp rounded-xl py-3 px-6 ease-in-out duration-300 border focus:outline-none font-barlow italic uppercase font-semibold tracking-wide ${
              isLoading ? "opacity-50" : "opacity-100"
            }`}
          >
            {isLoading ? (
              <>
                <svg
                  role="status"
                  className="inline w-4 h-4 mr-2 text-gray-200 animate-spin dark:text-gray-600"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="#FF0037"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="#FF0037"
                  />
                </svg>
                Publicant...
              </>
            ) : (
              "Publicar"
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default Publica;

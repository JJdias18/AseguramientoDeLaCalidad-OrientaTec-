import {
  createQuestion,
  deactivateQuestion,
  getQuestions,
  updateQuestion,
} from '../../services/adminQuestionService';

jest.mock('../../services/apiClient', () => jest.fn());

const apiRequest = jest.requireMock('../../services/apiClient');

describe('adminQuestionService (cliente, HU-07)', () => {
  afterEach(() => jest.resetAllMocks());

  it('getQuestions pide GET /admin/questions', async () => {
    apiRequest.mockResolvedValue({ questions: [] });
    await getQuestions('jwt');
    expect(apiRequest).toHaveBeenCalledWith('/admin/questions', { token: 'jwt' });
  });

  it('createQuestion pide POST /admin/questions con el texto y el tipo', async () => {
    apiRequest.mockResolvedValue({ question: {} });
    await createQuestion('jwt', { text: 'Un reactivo', riasecType: 'R' });
    expect(apiRequest).toHaveBeenCalledWith('/admin/questions', {
      method: 'POST',
      body: { text: 'Un reactivo', riasecType: 'R' },
      token: 'jwt',
    });
  });

  it('updateQuestion pide PUT /admin/questions/:id', async () => {
    apiRequest.mockResolvedValue({ question: {} });
    await updateQuestion('jwt', 5, { text: 'Editado', riasecType: 'I' });
    expect(apiRequest).toHaveBeenCalledWith('/admin/questions/5', {
      method: 'PUT',
      body: { text: 'Editado', riasecType: 'I' },
      token: 'jwt',
    });
  });

  it('deactivateQuestion pide DELETE /admin/questions/:id (soft delete)', async () => {
    apiRequest.mockResolvedValue({ question: {} });
    await deactivateQuestion('jwt', 5);
    expect(apiRequest).toHaveBeenCalledWith('/admin/questions/5', {
      method: 'DELETE',
      token: 'jwt',
    });
  });
});
